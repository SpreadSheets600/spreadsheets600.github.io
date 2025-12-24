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

	const getAccessToken = async () => {
		const response = await fetch("https://accounts.spotify.com/api/token", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
			},
			body: `grant_type=refresh_token&refresh_token=${process.env.SPOTIFY_REFRESH_TOKEN}`,
		});
		const data = await response.json();
		return data.access_token;
	};

	try {
		const token = await getAccessToken();
		const response = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
			headers: { Authorization: `Bearer ${token}` },
		});

		if (response.status === 204) {
			return {
				statusCode: 200,
				headers,
				body: JSON.stringify({ is_playing: false }),
			};
		}

		const data = await response.json();
		const result = {
			is_playing: data.is_playing,

			track: data.item?.name,
			artist: data.item?.artists?.[0]?.name,

			album: data.item?.album?.name,
			image: data.item?.album?.images?.[0]?.url,

			progress_ms: data.progress_ms,
			duration_ms: data.item?.duration_ms,
		};

		return {
			statusCode: 200,
			headers,
			body: JSON.stringify(result),
		};
	} catch (error) {
		return {
			statusCode: 200,
			headers,
			body: JSON.stringify({ is_playing: false, error: "Spotify Unavailable" }),
		};
	}
};
