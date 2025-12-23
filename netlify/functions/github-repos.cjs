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
		const username = event.queryStringParameters?.username || 'SpreadSheets600';
		const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`, {
			headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` },
		});
		const data = await response.json();

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
