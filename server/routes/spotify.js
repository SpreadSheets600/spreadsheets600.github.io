import express from "express";
import axios from "axios";

const router = express.Router();

let accessToken = null;
let tokenExpiry = null;

async function refreshAccessToken() {
	try {
		const response = await axios.post(
			"https://accounts.spotify.com/api/token",
			new URLSearchParams({
				grant_type: "refresh_token",
				refresh_token: process.env.SPOTIFY_REFRESH_TOKEN,
			}),
			{
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
					Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
				},
			}
		);

		accessToken = response.data.access_token;
		tokenExpiry = Date.now() + response.data.expires_in * 1000;
		return accessToken;
	} catch (error) {
		console.error("Error refreshing Spotify token:", error.response?.data || error.message);
		throw error;
	}
}

async function getValidToken() {
	if (!accessToken || Date.now() >= tokenExpiry) {
		await refreshAccessToken();
	}
	return accessToken;
}

router.get("/current-track", async (req, res) => {
	try {
		const token = await getValidToken();

		const response = await axios.get("https://api.spotify.com/v1/me/player/currently-playing", {
			headers: { Authorization: `Bearer ${token}` },
		});

		if (response.status === 204 || !response.data) {
			const recentResponse = await axios.get("https://api.spotify.com/v1/me/player/recently-played?limit=1", {
				headers: { Authorization: `Bearer ${token}` },
			});

			if (recentResponse.data.items.length > 0) {
				const track = recentResponse.data.items[0].track;
				const image = track.album.images ? track.album.images.find((img) => img.width >= 300) || track.album.images[0] : null;
				return res.json({
					is_playing: false,
					recently_played: true,
					track: track.name,
					artist: track.artists[0].name,
					album: track.album.name,
					image: image?.url,
					duration_ms: track.duration_ms,
					progress_ms: 0,
				});
			}

			return res.json({ is_playing: false, recently_played: false });
		}

		const { item, is_playing, progress_ms, context } = response.data;
		const image = item.album.images ? item.album.images.find((img) => img.width >= 300) || item.album.images[0] : null;

		let context_info = null;
		if (context) {
			context_info = {
				type: context.type,
				name: context.type === "playlist" ? "Playlist" : "Album",
				url: context.external_urls.spotify,
			};

			if (context.type === "playlist") {
				try {
					const playlistResponse = await axios.get(context.href, {
						headers: { Authorization: `Bearer ${token}` },
					});
					context_info.name = playlistResponse.data.name;
				} catch (e) {
					// Could not fetch playlist name from context, do nothing
				}
			} else if (context.type === "album") {
				context_info.name = item.album.name;
			}
		}

		res.json({
			is_playing,
			recently_played: false,
			track: item.name,
			artist: item.artists[0].name,
			album: item.album.name,
			image: image?.url,
			duration_ms: item.duration_ms,
			progress_ms,
			context: context_info,
		});
	} catch (error) {
		console.error("Spotify API error:", error.response?.data || error.message);
		console.error("Stack Trace:", error.stack); // Added detailed stack trace logging
		res.status(500).json({ error: "Failed to fetch Spotify data", details: error.response?.data || error.message }); // Added detailed error response
	}
});

router.get("/playlists", async (req, res) => {
	try {
		const token = await getValidToken();

		let allPlaylists = [];
		let nextUrl = "https://api.spotify.com/v1/me/playlists?offset=5&limit=50";

		while (nextUrl) {
			const response = await axios.get(nextUrl, {
				headers: { Authorization: `Bearer ${token}` },
			});
			allPlaylists.push(...response.data.items);
			nextUrl = response.data.next;
		}

		const shuffled = allPlaylists.sort(() => 0.5 - Math.random());
		const selected = shuffled.slice(0, 4);

		const playlists = selected.map((p) => ({
			name: p.name,
			url: p.external_urls.spotify,
			image: p.images.find((img) => img.width >= 300)?.url || p.images[0]?.url,
		}));

		console.log("Fetched playlists:", playlists);
		res.json(playlists);
	} catch (error) {
		console.error("Spotify API error (playlists):", error.response?.data || error.message);
		console.error("Stack Trace:", error.stack);
		res.status(500).json({ error: "Failed to fetch Spotify playlists", details: error.response?.data || error.message });
	}
});

export { router as spotifyRouter };
