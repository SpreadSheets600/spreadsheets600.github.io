export const prerender = false;

// Cloudflare Workers compatible — uses only native fetch(), no Node.js modules.

const STEAM_API_BASE = "https://api.steampowered.com";
const CDN_BASE = "https://cdn.akamai.steamstatic.com/steam/apps";

const json = (data, status = 200) =>
	new Response(JSON.stringify(data), {
		status,
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			"Cache-Control": "no-store",
		},
	});

const headerForAppFallback = (appId) => `${CDN_BASE}/${appId}/header.jpg`;


async function steamFetch(path, params, apiKey) {
	const url = new URL(`${STEAM_API_BASE}${path}`);
	url.searchParams.set("key", apiKey);
	url.searchParams.set("format", "json");
	for (const [k, v] of Object.entries(params)) {
		url.searchParams.set(k, String(v));
	}
	
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 6000);

	try {
		const res = await fetch(url.toString(), { signal: controller.signal });
		clearTimeout(timeoutId);

		if (!res.ok) {
			const err = new Error(`Steam API error ${res.status} on ${path}`);
			err.upstreamStatus = res.status;
			throw err;
		}
		return res.json();
	} catch (error) {
		clearTimeout(timeoutId);
		throw error;
	}
}

async function resolveVanityURL(vanity, apiKey) {
	const data = await steamFetch("/ISteamUser/ResolveVanityURL/v1/", { vanityurl: vanity }, apiKey);
	const response = data?.response;
	if (!response || response.success !== 1 || !response.steamid) {
		const err = new Error("Steam vanity URL could not be resolved.");
		err.upstreamStatus = 404;
		throw err;
	}
	return response.steamid;
}

async function getPlayerSummaries(steamId, apiKey) {
	const data = await steamFetch("/ISteamUser/GetPlayerSummaries/v2/", { steamids: steamId }, apiKey);
	return data?.response?.players || [];
}

async function getOwnedGames(steamId, apiKey) {
	const data = await steamFetch("/IPlayerService/GetOwnedGames/v1/", {
		steamid: steamId,
		include_appinfo: 0,
		include_played_free_games: 1,
	}, apiKey);
	return data?.response || {};
}

async function getRecentlyPlayedGames(steamId, apiKey, count = 4) {
	const data = await steamFetch("/IPlayerService/GetRecentlyPlayedGames/v1/", {
		steamid: steamId,
		count,
	}, apiKey);
	return data?.response || {};
}

// --- Image resolution helpers ---

// NOTE: In-memory cache is request-scoped on Cloudflare Workers (isolates are
// ephemeral). This prevents redundant fetches *within* a single request only.
// For cross-request caching, bind a KV namespace in wrangler.toml.
const _requestCache = new Map();

async function getSteamStoreImage(appId) {
	if (!appId) return null;
	const cacheKey = `steam-store-image:${appId}`;
	if (_requestCache.has(cacheKey)) return _requestCache.get(cacheKey);

	try {
		const res = await fetch(
			`https://store.steampowered.com/api/appdetails/?appids=${appId}&filters=basic`,
		);
		if (!res.ok) return null;
		const data = await res.json();
		const img = data?.[appId]?.data?.header_image;
		if (img) _requestCache.set(cacheKey, img);
		return img || null;
	} catch {
		return null;
	}
}

async function getGameImage(gameName, appId, env) {
	const rawgKey = env?.RAWG_API_KEY || import.meta.env.RAWG_API_KEY;

	if (rawgKey && gameName) {
		const cacheKey = `rawg-image:${gameName}`;
		if (_requestCache.has(cacheKey)) return _requestCache.get(cacheKey);

		try {
			const url = new URL("https://api.rawg.io/api/games");
			url.searchParams.set("search", gameName);
			url.searchParams.set("key", rawgKey);
			url.searchParams.set("page_size", "1");

			const res = await fetch(url.toString());
			if (res.ok) {
				const data = await res.json();
				const img = data?.results?.[0]?.background_image;
				if (img) {
					_requestCache.set(cacheKey, img);
					return img;
				}
			}
		} catch {
			// fall through to Steam store image
		}
	}

	const storeImage = await getSteamStoreImage(appId);
	if (storeImage) return storeImage;

	return headerForAppFallback(appId);
}

// --- Route handler ---

export async function GET(context) {
	const { request } = context;
	const env = context.locals.runtime?.env || {};
	const apiKey = env.STEAM_API_KEY || import.meta.env.STEAM_API_KEY;

	if (!apiKey) {
		return json(
			{ error: "Missing Steam API key. Set STEAM_API_KEY in your environment." },
			500,
		);
	}

	const url = new URL(request.url);
	const querySteamId = url.searchParams.get("steamId");
	const queryVanity = url.searchParams.get("vanity");

	const envSteamId = env.STEAM_ID || import.meta.env.STEAM_ID;
	const envVanity = env.STEAM_VANITY || import.meta.env.STEAM_VANITY;

	let steamId = querySteamId || envSteamId || "";
	const vanity = queryVanity || envVanity || "";

	try {
		// Resolve vanity to steam ID if needed
		if (!steamId) {
			if (!vanity) {
				return json({ error: "Missing Steam ID or vanity name." }, 400);
			}
			steamId = await resolveVanityURL(vanity, apiKey);
		}

		// Fetch all three endpoints in parallel
		const [players, ownedData, recentData] = await Promise.all([
			getPlayerSummaries(steamId, apiKey),
			getOwnedGames(steamId, apiKey),
			getRecentlyPlayedGames(steamId, apiKey, 4),
		]);

		const player = players?.[0];
		if (!player) {
			return json({ error: "Steam profile not found." }, 404);
		}

		const profile = {
			profileUrl: player.profileurl,
			avatar: player.avatarfull || player.avatarmedium || player.avatar || "",
			name: player.personaname || "Unknown",
			status: player.personastate ?? 0,
			lastLogoff: player.lastlogoff,
			currentGame:
				player.gameid
					? {
						id: player.gameid,
						name: player.gameextrainfo || "In-game",
						header: await getGameImage(player.gameextrainfo, player.gameid, env),
					}
					: null,
		};

		const totalGames = ownedData?.game_count ?? 0;
		const totalMinutes = Array.isArray(ownedData?.games)
			? ownedData.games.reduce((sum, game) => sum + (game.playtime_forever || 0), 0)
			: 0;
		const totalHours = Math.round(totalMinutes / 60);

		const recentGamesRaw = recentData?.games || [];
		const recentGames = await Promise.all(
			recentGamesRaw.map(async (game) => ({
				appid: game.appid,
				name: game.name,
				playtime_2weeks: game.playtime_2weeks,
				playtime_forever: game.playtime_forever,
				header: await getGameImage(game.name, game.appid, env),
			})),
		);

		return json({
			profile,
			stats: { totalGames, totalHours },
			recentGames,
			meta: { fromCache: false, isStaleFallback: false, cachedAt: Date.now() },
		});
	} catch (err) {
		const status =
			err?.upstreamStatus === 400 ? 400
				: err?.upstreamStatus === 404 ? 404
					: err?.upstreamStatus ? 502
						: 500;
		return json(
			{
				error: err?.message || "Steam status unavailable.",
				upstreamStatus: err?.upstreamStatus,
			},
			status,
		);
	}
}
