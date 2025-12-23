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
		const response = await fetch("https://api.spotify.com/v1/me/playlists?limit=50", {
			headers: { Authorization: `Bearer ${token}` },
		});

		const data = await response.json();
		const shuffled = data.items?.sort(() => 0.5 - Math.random()) || [];
		const selected = shuffled.slice(0, 4);

		const playlists = selected.map((p) => ({
			name: p.name,
			url: p.external_urls.spotify,
			image: p.images?.[0]?.url,
		}));

		return {
			statusCode: 200,
			headers,
			body: JSON.stringify(playlists),
		};
	} catch (error) {
		return {
			statusCode: 200,
			headers,
			body: JSON.stringify([]),
		};
	}
};
