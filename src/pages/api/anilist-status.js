export const prerender = false;
import { getCachedOrFetch } from "../../lib/cache.js";

const json = (data, status = 200) =>
	new Response(JSON.stringify(data), {
		status,
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			"Cache-Control": "no-store",
		},
	});

async function fetchAniList(query, variables) {
	const response = await fetch("https://graphql.anilist.co", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ query, variables }),
	});

	if (!response.ok) {
		const text = await response.text();
		const err = new Error(text || `AniList API error (${response.status})`);
		err.upstreamStatus = response.status;
		throw err;
	}

	return response.json();
}

export async function GET({ request }) {
	const url = new URL(request.url);
	const queryUsername = url.searchParams.get("username");
	const envUsername = import.meta.env.ANILIST_USERNAME;
	const username = queryUsername || envUsername || "SpreadSheeets";
	const cacheKey = `anilist-status:${username}`;
	const ttlMs = 10 * 60 * 1000;

	try {
		const query = `
            query ($name: String, $userId: Int) {
                User(name: $name) {
                    id
                    name
                    avatar { large }
                    siteUrl
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
                                type
                                format
                                title { english romaji }
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
                                type
                                format
                                title { english romaji }
                                coverImage { large }
                                siteUrl
                            }
                        }
                    }
                }
            }
        `;

		const cached = await getCachedOrFetch(cacheKey, ttlMs, async () => {
			const userResponse = await fetchAniList(`query ($name: String) { User(name: $name) { id } }`, { name: username });
			if (!userResponse.data?.User?.id) {
				const err = new Error("User not found");
				err.upstreamStatus = 404;
				throw err;
			}
			const response = await fetchAniList(query, {
				name: username,
				userId: userResponse.data.User.id,
			});
			return response.data || {};
		});

		return json({
			...cached.data,
			meta: {
				fromCache: cached.fromCache,
				isStaleFallback: cached.isStaleFallback,
				cachedAt: cached.cachedAt,
			},
		});
	} catch (err) {
		const status =
			err?.upstreamStatus === 404 ? 404
			: err?.upstreamStatus ? 502
			: 500;
		return json(
			{
				error: err?.message || "AniList status unavailable.",
				upstreamStatus: err?.upstreamStatus,
			},
			status,
		);
	}
}
