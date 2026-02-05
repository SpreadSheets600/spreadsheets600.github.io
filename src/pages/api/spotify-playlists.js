export const prerender = false;

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const API_BASE = "https://api.spotify.com/v1";

const json = (data, status = 200) =>
	new Response(JSON.stringify(data), {
		status,
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			"Cache-Control": "public, max-age=300",
		},
	});

function toBase64(value) {
	if (typeof btoa === "function") return btoa(value);
	return Buffer.from(value).toString("base64");
}

async function getAccessToken(clientId, clientSecret) {
	const credentials = toBase64(`${clientId}:${clientSecret}`);
	const res = await fetch(TOKEN_URL, {
		method: "POST",
		headers: {
			Authorization: `Basic ${credentials}`,
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: "grant_type=client_credentials",
	});

	if (!res.ok) {
		throw new Error(`Failed to get Spotify token: ${res.status}`);
	}

	const data = await res.json();
	return data.access_token;
}

async function fetchSpotify(endpoint, token) {
	const res = await fetch(`${API_BASE}${endpoint}`, {
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: "application/json",
		},
	});

	if (!res.ok) {
		throw new Error(`Spotify API error: ${res.status}`);
	}

	return res.json();
}

function shuffleArray(array) {
	const arr = [...array];
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}

export async function GET({ request }) {
	const clientId = import.meta.env.SPOTIFY_CLIENT_ID;
	const clientSecret = import.meta.env.SPOTIFY_CLIENT_SECRET;
	const spotifyUserId = import.meta.env.SPOTIFY_USER_ID;

	if (!clientId || !clientSecret) {
		return json({ error: "Missing Spotify API credentials." }, 500);
	}

	if (!spotifyUserId) {
		return json({ error: "Missing Spotify user ID." }, 500);
	}

	const url = new URL(request.url);
	const count = Math.min(parseInt(url.searchParams.get("count") || "3", 10), 10);

	try {
		const token = await getAccessToken(clientId, clientSecret);
		const data = await fetchSpotify(`/users/${spotifyUserId}/playlists?limit=50`, token);

		const playlists = (data.items || [])
			.filter((p) => p.public)
			.map((p) => ({
				id: p.id,
				name: p.name,
				description: p.description || "",
				image: p.images?.[0]?.url || null,
				tracks: p.tracks?.total || 0,
				url: p.external_urls?.spotify || `https://open.spotify.com/playlist/${p.id}`,
				owner: p.owner?.display_name || "",
			}));

		const randomPlaylists = shuffleArray(playlists).slice(0, count);

		return json({ playlists: randomPlaylists });
	} catch (err) {
		return json({ error: err?.message || "Failed to fetch playlists." }, 500);
	}
}
