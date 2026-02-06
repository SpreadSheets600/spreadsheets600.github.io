export const prerender = false;
import { getCachedOrFetch } from "../../lib/cache.js";

const API_BASE = "https://api.steampowered.com";
const CDN_BASE = "https://cdn.cloudflare.steamstatic.com/steam/apps";

const json = (data, status = 200) =>
	new Response(JSON.stringify(data), {
		status,
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			"Cache-Control": "no-store",
		},
	});

const withParams = (path, params) => {
	const url = new URL(path, API_BASE);
	Object.entries(params).forEach(([key, value]) => {
		if (value !== undefined && value !== null && value !== "") {
			url.searchParams.set(key, String(value));
		}
	});
	return url.toString();
};

const headerForApp = (appId) => `${CDN_BASE}/${appId}/header.jpg`;

async function fetchSteam(url) {
	const res = await fetch(url, { headers: { Accept: "application/json" } });
	if (!res.ok) {
		const text = await res.text();
		const err = new Error(text || `Steam API error (${res.status})`);
		err.upstreamStatus = res.status;
		throw err;
	}
	return res.json();
}

async function resolveVanity(apiKey, vanity) {
	const url = withParams("/ISteamUser/ResolveVanityURL/v0001/", {
		key: apiKey,
		vanityurl: vanity,
	});
	const data = await fetchSteam(url);
	const response = data?.response;
	if (!response || response.success !== 1 || !response.steamid) {
		const err = new Error("Steam vanity URL could not be resolved.");
		err.upstreamStatus = 404;
		throw err;
	}
	return response.steamid;
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
			let resolvedSteamId = steamId;
			if (!resolvedSteamId) {
				if (!vanity) {
					const err = new Error("Missing Steam ID or vanity name.");
					err.upstreamStatus = 400;
					throw err;
				}
				resolvedSteamId = await resolveVanity(apiKey, vanity);
			}

			const [summaryData, ownedData, recentData] = await Promise.all([
				fetchSteam(
					withParams("/ISteamUser/GetPlayerSummaries/v0002/", {
						key: apiKey,
						steamids: resolvedSteamId,
					}),
				),
				fetchSteam(
					withParams("/IPlayerService/GetOwnedGames/v0001/", {
						key: apiKey,
						steamid: resolvedSteamId,
						include_appinfo: 0,
						include_played_free_games: 1,
					}),
				),
				fetchSteam(
					withParams("/IPlayerService/GetRecentlyPlayedGames/v0001/", {
						key: apiKey,
						steamid: resolvedSteamId,
						count: 4,
					}),
				),
			]);

			const player = summaryData?.response?.players?.[0];
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
							header: headerForApp(player.gameid),
						}
					:	null,
			};

			const owned = ownedData?.response || {};
			const totalGames = owned.game_count ?? 0;
			const totalMinutes = Array.isArray(owned.games) ? owned.games.reduce((sum, game) => sum + (game.playtime_forever || 0), 0) : 0;
			const totalHours = Math.round(totalMinutes / 60);

			const recentGamesRaw = recentData?.response?.games || [];
			const recentGames = recentGamesRaw.map((game) => ({
				appid: game.appid,
				name: game.name,
				playtime_2weeks: game.playtime_2weeks,
				playtime_forever: game.playtime_forever,
				header: headerForApp(game.appid),
			}));

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
