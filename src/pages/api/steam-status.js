export const prerender = false;
import { getCachedOrFetch } from "../../lib/cache.js";
import Steam from "steam-webapi";
import util from "util";

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

async function getSteamStoreImage(appId) {
	if (!appId) return null;
	const cacheKey = `steam-store-image:${appId}`;
	try {
		const cached = await getCachedOrFetch(cacheKey, 7 * 24 * 60 * 60 * 1000, async () => {
			const res = await fetch(
				`https://store.steampowered.com/api/appdetails/?appids=${appId}&filters=basic`,
			);
			if (!res.ok) throw new Error("Steam Store API error");
			const data = await res.json();
			const img = data?.[appId]?.data?.header_image;
			if (!img) throw new Error("No header_image in response");
			return img;
		});
		return cached.data || null;
	} catch {
		return null;
	}
}

async function getGameImage(gameName, appId) {
	const rawgKey = import.meta.env.RAWG_API_KEY;

	if (rawgKey && gameName) {
		const cacheKey = `rawg-image:${gameName}`;
		try {
			const cached = await getCachedOrFetch(cacheKey, 7 * 24 * 60 * 60 * 1000, async () => {
				const url = new URL("https://api.rawg.io/api/games");

				url.searchParams.set("search", gameName);
				url.searchParams.set("key", rawgKey);
				url.searchParams.set("page_size", "1");

				const res = await fetch(url.toString());

				if (!res.ok) throw new Error("RAWG API error");
				const data = await res.json();

				const img = data?.results?.[0]?.background_image;
				if (!img) throw new Error("No image in RAWG result");
				return img;
			});
			if (cached.data) return cached.data;
		} catch {

		}
	}

	const storeImage = await getSteamStoreImage(appId);
	if (storeImage) return storeImage;

	return headerForAppFallback(appId);
}

let steamInstance = null;
let steamReadyPromise = null;

async function getSteamClient(apiKey) {
	if (steamInstance) return steamInstance;
	if (!steamReadyPromise) {
		Steam.key = apiKey;
		const ready = util.promisify(Steam.ready);
		steamReadyPromise = ready().then(() => {
			const steam = new Steam();
			steam.resolveVanityURLAsync = util.promisify(steam.resolveVanityURL.bind(steam));
			steam.getPlayerSummariesAsync = util.promisify(steam.getPlayerSummaries.bind(steam));
			steam.getOwnedGamesAsync = util.promisify(steam.getOwnedGames.bind(steam));
			steam.getRecentlyPlayedGamesAsync = util.promisify(steam.getRecentlyPlayedGames.bind(steam));
			steamInstance = steam;
			return steam;
		});
	}
	return steamReadyPromise;
}

export async function GET({ request }) {
	const apiKey = import.meta.env.STEAM_API_KEY;
	if (!apiKey) {
		return json(
			{
				error: "Missing Steam API key. Set STEAM_API_KEY in your environment.",
			},
			500,
		);
	}

	const url = new URL(request.url);
	const querySteamId = url.searchParams.get("steamId");
	const queryVanity = url.searchParams.get("vanity");

	const envSteamId = import.meta.env.STEAM_ID;
	const envVanity = import.meta.env.STEAM_VANITY;

	let steamId = querySteamId || envSteamId || "";
	const vanity = queryVanity || envVanity || "";
	const cacheId = steamId || vanity;
	const cacheKey = `steam-status:${cacheId}`;
	const ttlMs = 5 * 60 * 1000;

	try {
		const cached = await getCachedOrFetch(cacheKey, ttlMs, async () => {
			const steamClient = await getSteamClient(apiKey);
			let resolvedSteamId = steamId;

			if (!resolvedSteamId) {
				if (!vanity) {
					const err = new Error("Missing Steam ID or vanity name.");
					err.upstreamStatus = 400;
					throw err;
				}
				const vanityData = await steamClient.resolveVanityURLAsync({ vanityurl: vanity });
				if (!vanityData || vanityData.success !== 1 || !vanityData.steamid) {
					const err = new Error("Steam vanity URL could not be resolved.");
					err.upstreamStatus = 404;
					throw err;
				}
				resolvedSteamId = vanityData.steamid;
			}

			const [summaryData, ownedData, recentData] = await Promise.all([
				steamClient.getPlayerSummariesAsync({ steamids: resolvedSteamId }),
				steamClient.getOwnedGamesAsync({
					steamid: resolvedSteamId,
					include_appinfo: 0,
					include_played_free_games: 1,
					appids_filter: [],
					include_free_sub: 0,
					language: "english",
					include_extended_appinfo: 0,
				}),
				steamClient.getRecentlyPlayedGamesAsync({ steamid: resolvedSteamId, count: 4 }),
			]);

			const player = summaryData?.players?.[0];
			if (!player) {
				const err = new Error("Steam profile not found.");
				err.upstreamStatus = 404;
				throw err;
			}

			const profile = {
				profileUrl: player.profileurl,
				avatar: player.avatarfull || player.avatarmedium || player.avatar || "",
				name: player.personaname || "Unknown",
				status: player.personastate ?? 0,
				lastLogoff: player.lastlogoff,
				currentGame:
					player.gameid ?
						{
							id: player.gameid,
							name: player.gameextrainfo || "In-game",
							header: await getGameImage(player.gameextrainfo, player.gameid),
						}
						: null,
			};

			const totalGames = ownedData?.game_count ?? 0;
			const totalMinutes = Array.isArray(ownedData?.games) ? ownedData.games.reduce((sum, game) => sum + (game.playtime_forever || 0), 0) : 0;
			const totalHours = Math.round(totalMinutes / 60);

			const recentGamesRaw = recentData?.games || [];
			const recentGames = await Promise.all(
				recentGamesRaw.map(async (game) => ({
					appid: game.appid,
					name: game.name,
					playtime_2weeks: game.playtime_2weeks,
					playtime_forever: game.playtime_forever,
					header: await getGameImage(game.name, game.appid),
				}))
			);

			return {
				profile,
				stats: { totalGames, totalHours },
				recentGames,
			};
		});

		return json({
			...cached.data,
			meta: {
				fromCache: cached.fromCache,
				isStaleFallback: cached.isStaleFallback,
				cachedAt: cached.cachedAt,
			},
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
