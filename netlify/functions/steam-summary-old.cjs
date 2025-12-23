exports.handler = async (event, context) => {
	const headers = {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Headers": "Content-Type",
		"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
		"Content-Type": "application/json",
	};

	if (event.httpMethod === "OPTIONS") {
		return { statusCode: 200, headers, body: "" };
	}

	try {
		const response = await fetch(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${process.env.STEAM_USER_ID}`);
		const data = await response.json();

		return {
			statusCode: 200,
			headers,
			body: JSON.stringify(data.response.players[0] || {}),
		};
	} catch (error) {
		return {
			statusCode: 500,
			headers,
			body: JSON.stringify({ error: error.message }),
		};
	}
};
