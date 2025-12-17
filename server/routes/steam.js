import express from "express";
import axios from "axios";

const router = express.Router();
const CACHE_TTL_MS = 30_000;

let cached = {
	data: null,
	expiresAt: 0,
};

const personaStateText = (state) => {
	switch (state) {
		case 1:
			return "online";
		case 2:
			return "busy";
		case 3:
			return "away";
		case 4:
			return "snooze";
		case 5:
			return "looking to trade";
		case 6:
			return "looking to play";
		default:
			return "offline";
	}
};

const gameHeaderUrl = (appId) => (appId ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg` : null);
const gameIconUrl = (appId, hash) => (appId && hash ? `https://media.steampowered.com/steamcommunity/public/images/apps/${appId}/${hash}.jpg` : null);

router.get("/summary", async (req, res) => {
	try {
		const { STEAM_API_KEY, STEAM_USER_ID } = process.env;

		if (!STEAM_API_KEY || !STEAM_USER_ID) {
			return res.status(500).json({ error: "STEAM_API_KEY or STEAM_USER_ID is not configured" });
		}

		const now = Date.now();
		if (cached.data && cached.expiresAt > now) {
			return res.json(cached.data);
		}

		const playerSummaryUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${STEAM_USER_ID}`;
		const recentGamesUrl = `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/?key=${STEAM_API_KEY}&steamid=${STEAM_USER_ID}&count=10`;
		const ownedGamesUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${STEAM_API_KEY}&steamid=${STEAM_USER_ID}&include_appinfo=true&include_played_free_games=true`;

		const [playerResponse, recentResponse, ownedResponse] = await Promise.all([
			axios.get(playerSummaryUrl),
			axios.get(recentGamesUrl).catch((err) => {
				console.warn("[steam] failed to fetch recent games", err.response?.data || err.message);
				return { data: { response: { games: [] } } };
			}),
			axios.get(ownedGamesUrl).catch((err) => {
				console.warn("[steam] failed to fetch owned games (maybe private?)", err.response?.data || err.message);
				return { data: { response: { games: [] } } };
			}),
		]);

		const player = playerResponse.data?.response?.players?.[0];
		if (!player) {
			return res.status(404).json({ error: "Steam user not found" });
		}

		const ownedGames = ownedResponse.data?.response?.games || [];
		const totalGames = ownedGames.length;
		const totalHoursPlayed = ownedGames.reduce((acc, game) => acc + (game.playtime_forever || 0), 0) / 60;

		const recentGames = (recentResponse.data?.response?.games || []).map((g) => ({
			appId: g.appid,
			name: g.name,
			playtime2Weeks: g.playtime_2weeks || 0,
			playtimeForever: g.playtime_forever || 0,
			icon: gameIconUrl(g.appid, g.img_icon_url),
			header: gameHeaderUrl(g.appid),
		}));

		const currentlyPlaying = player.gameextrainfo
			? {
					name: player.gameextrainfo,
					appId: player.gameid || null,
					server: player.gameserverip || null,
					image: gameHeaderUrl(player.gameid),
			  }
			: null;

		const data = {
			id: player.steamid,
			name: player.personaname,
			avatar: player.avatarfull,
			profileUrl: player.profileurl,
			status: personaStateText(player.personastate),
			statusCode: player.personastate,
			currentlyPlaying,
			recentGames,
			totalGames,
			totalHoursPlayed: totalHoursPlayed.toFixed(1),
			lastLogoff: player.lastlogoff ? player.lastlogoff * 1000 : null,
			country: player.loccountrycode || null,
		};

		cached = {
			data,
			expiresAt: now + CACHE_TTL_MS,
		};

		return res.json(data);
	} catch (error) {
		console.error("[steam] API error:", error.response?.data || error.message);
		return res.status(500).json({ error: "Failed to fetch Steam data" });
	}
});

export { router as steamRouter };
