exports.handler = async (event, context) => {
	const headers = {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Headers": "Content-Type",
		"Access-Control-Allow-Methods": "GET, OPTIONS",
		"Content-Type": "application/json",
	};

	if (event.httpMethod === "OPTIONS") {
		return { statusCode: 200, headers, body: "" };
	}

	try {
		const STEAM_API_KEY = process.env.STEAM_API_KEY;
		const STEAM_USER_ID = process.env.STEAM_USER_ID;

		if (!STEAM_API_KEY || !STEAM_USER_ID) {
			return { statusCode: 500, headers, body: JSON.stringify({ error: "Steam API not configured" }) };
		}

		const playerSummaryUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${STEAM_USER_ID}`;
		const recentGamesUrl = `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/?key=${STEAM_API_KEY}&steamid=${STEAM_USER_ID}&count=10`;
		const ownedGamesUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${STEAM_API_KEY}&steamid=${STEAM_USER_ID}&include_appinfo=true&include_played_free_games=true`;

		const [playerResponse, recentResponse, ownedResponse] = await Promise.all([
			fetch(playerSummaryUrl).then((r) => r.json()),
			fetch(recentGamesUrl)
				.then((r) => r.json())
				.catch(() => ({ response: { games: [] } })),
			fetch(ownedGamesUrl)
				.then((r) => r.json())
				.catch(() => ({ response: { games: [] } })),
		]);

		const player = playerResponse.response?.players?.[0];
		if (!player) {
			return { statusCode: 404, headers, body: JSON.stringify({ error: "Steam user not found" }) };
		}

		const ownedGames = ownedResponse.response?.games || [];
		const totalGames = ownedGames.length;
		const totalHoursPlayed = ownedGames.reduce((acc, game) => acc + (game.playtime_forever || 0), 0) / 60;

		const recentGames = (recentResponse.response?.games || []).map((g) => ({
			appId: g.appid,
			name: g.name,
			playtime2Weeks: g.playtime_2weeks || 0,
			playtimeForever: g.playtime_forever || 0,
			icon: g.appid ? `https://media.steampowered.com/steamcommunity/public/images/apps/${g.appid}/${g.img_icon_url}.jpg` : null,
			header: g.appid ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/header.jpg` : null,
		}));

		const currentlyPlaying = player.gameextrainfo
			? {
					name: player.gameextrainfo,
					appId: player.gameid || null,
					server: player.gameserverip || null,
					image: player.gameid ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${player.gameid}/header.jpg` : null,
			  }
			: null;

		const data = {
			id: player.steamid,
			name: player.personaname,
			avatar: player.avatarfull,
			profileUrl: player.profileurl,
			status: ["offline", "online", "busy", "away", "snooze", "looking to trade", "looking to play"][player.personastate] || "offline",
			statusCode: player.personastate,
			currentlyPlaying,
			recentGames,
			totalGames,
			totalHoursPlayed: totalHoursPlayed.toFixed(1),
			lastLogoff: player.lastlogoff ? player.lastlogoff * 1000 : null,
			country: player.loccountrycode || null,
		};

		return {
			statusCode: 200,
			headers,
			body: JSON.stringify(data),
		};
	} catch (error) {
		return {
			statusCode: 500,
			headers,
			body: JSON.stringify({ error: error.message }),
		};
	}
};
