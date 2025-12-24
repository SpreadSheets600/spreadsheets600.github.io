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
		const username = event.queryStringParameters?.username || "SpreadSheeets";

		const userResponse = await fetch("https://graphql.anilist.co", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				query: `query ($name: String) { User(name: $name) { id } }`,
				variables: { name: username },
			}),
		});

		const userData = await userResponse.json();
		if (!userData.data?.User) {
			return { statusCode: 404, headers, body: JSON.stringify({ error: "User not found" }) };
		}

		const userId = userData.data.User.id;

		const query = `
			query ($name: String, $userId: Int) {
				User(name: $name) {
					id name avatar { large } siteUrl
					statistics {
						anime { count minutesWatched episodesWatched meanScore }
						manga { count chaptersRead volumesRead meanScore }
					}
				}
				latestAnime: Page(perPage: 1) {
					activities(userId: $userId, sort: ID_DESC, type_in: ANIME_LIST) {
						... on ListActivity {
							status
							media {
								type format
								title { english }
								coverImage { large }
								siteUrl
							}
						}
					}
				}
				latestManga: Page(perPage: 1) {
					activities(userId: $userId, sort: ID_DESC, type_in: MANGA_LIST) {
						... on ListActivity {
							status
							media {
								type format
								title { english }
								coverImage { large }
								siteUrl
							}
						}
					}
				}
			}
		`;

		const response = await fetch("https://graphql.anilist.co", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ query, variables: { name: username, userId } }),
		});

		const data = await response.json();
		return {
			statusCode: 200,
			headers,
			body: JSON.stringify(data.data || {}),
		};
	} catch (error) {
		return {
			statusCode: 500,
			headers,
			body: JSON.stringify({ error: error.message }),
		};
	}
};
