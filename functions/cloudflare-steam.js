export default {
	async fetch(request, env) {
		if (request.method === "OPTIONS") {
			return new Response(null, {
				status: 204,
				headers: {
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Methods": "GET, OPTIONS",
					"Access-Control-Allow-Headers": "Content-Type",
				},
			});
		}

		const { STEAM_API_KEY, STEAM_USER_ID } = env;

		if (!STEAM_API_KEY || !STEAM_USER_ID) {
			return new Response(JSON.stringify({ error: "STEAM_API_KEY or STEAM_USER_ID is not configured" }), {
				status: 500,
				headers: {
					"Content-Type": "application/json",
					"Access-Control-Allow-Origin": "*",
				},
			});
		}

		try {
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

			const player = playerResponse?.response?.players?.[0];
			if (!player) {
				return new Response(JSON.stringify({ error: "Steam user not found" }), {
					status: 404,
					headers: {
						"Content-Type": "application/json",
						"Access-Control-Allow-Origin": "*",
					},
				});
			}

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

			const ownedGames = ownedResponse?.response?.games || [];
			const totalGames = ownedGames.length;
			const totalHoursPlayed = ownedGames.reduce((acc, game) => acc + (game.playtime_forever || 0), 0) / 60;

			const recentGames = (recentResponse?.response?.games || []).map((g) => ({
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

			return new Response(JSON.stringify(data), {
				status: 200,
				headers: {
					"Content-Type": "application/json",
					"Access-Control-Allow-Origin": "*",
				},
			});
		} catch (error) {
			return new Response(JSON.stringify({ error: "Failed to fetch Steam data" }), {
				status: 500,
				headers: {
					"Content-Type": "application/json",
					"Access-Control-Allow-Origin": "*",
				},
			});
		}
	},
};


