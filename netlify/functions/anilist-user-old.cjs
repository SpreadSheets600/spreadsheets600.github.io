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
		const username = event.queryStringParameters?.username || "SpreadSheeets";
		const query = `
			query ($username: String) {
				User(name: $username) {
					id name avatar { large }
					statistics {
						anime { count meanScore minutesWatched }
						manga { count meanScore chaptersRead }
					}
				}
			}
		`;

		const response = await fetch("https://graphql.anilist.co", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ query, variables: { username } }),
		});

		const data = await response.json();
		return {
			statusCode: 200,
			headers,
			body: JSON.stringify(data.data?.User || {}),
		};
	} catch (error) {
		return {
			statusCode: 500,
			headers,
			body: JSON.stringify({ error: error.message }),
		};
	}
};
