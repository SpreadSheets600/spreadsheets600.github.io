import express from "express";
import axios from "axios";

const router = express.Router();

const ANILIST_API = "https://graphql.anilist.co";

router.get("/user/:username", async (req, res) => {
	const { username } = req.params;

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

	try {
		const userDataResponse = await fetch("https://graphql.anilist.co", {
			method: "POST",
			headers: { "Content-Type": "application/json", Accept: "application/json" },
			body: JSON.stringify({
				query: `query ($name: String) { User(name: $name) { id } }`,
				variables: { name: username },
			}),
		});

		const userData = await userDataResponse.json();
		if (!userData.data?.User) {
			return res.status(404).json({ error: "User not found" });
		}

		const userId = userData.data.User.id;

		const dataResponse = await fetch("https://graphql.anilist.co", {
			method: "POST",
			headers: { "Content-Type": "application/json", Accept: "application/json" },
			body: JSON.stringify({ query, variables: { name: username, userId } }),
		});

		const json = await dataResponse.json();

		if (json.errors) {
			console.error("AniList GraphQL errors:", json.errors);
			return res.status(500).json({ error: "GraphQL query failed" });
		}

		res.json(json.data);
	} catch (err) {
		console.error("Error Fetching AniList Data:", err);
		res.status(500).json({ error: "Failed to fetch AniList data" });
	}
});

export { router as anilistRouter };
