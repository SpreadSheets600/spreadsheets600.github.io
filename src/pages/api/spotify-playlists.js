export const prerender = false;
import { getCachedOrFetch } from "../../lib/cache.js";

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
	
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 6000);

	try {
		const res = await fetch(TOKEN_URL, {
			method: "POST",
			headers: {
				Authorization: `Basic ${credentials}`,
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: "grant_type=client_credentials",
			signal: controller.signal
		});

		clearTimeout(timeoutId);

		if (!res.ok) {
			let detail = "";
			try {
				detail = await res.text();
			} catch {}
			throw new Error(`Failed to get Spotify token: ${res.status}${detail ? ` - ${detail}` : ""}`);
		}

		const data = await res.json();
		return data.access_token;
	} catch (error) {
		clearTimeout(timeoutId);
		throw error;
	}
}

async function fetchSpotify(endpoint, token) {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 6000);

	try {
		const res = await fetch(`${API_BASE}${endpoint}`, {
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: "application/json",
			},
			signal: controller.signal
		});

		clearTimeout(timeoutId);

		if (!res.ok) {
			let detail = "";
			try {
				detail = await res.text();
			} catch {}
			throw new Error(`Spotify API error: ${res.status}${detail ? ` - ${detail}` : ""}`);
		}

		return res.json();
	} catch (error) {
		clearTimeout(timeoutId);
		throw error;
	}
}

function shuffleArray(array) {
	const arr = [...array];
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}

export async function GET(context) {
	const { request } = context;
	const clientId = context.locals.runtime?.env?.SPOTIFY_CLIENT_ID || import.meta.env.SPOTIFY_CLIENT_ID;
	const clientSecret = context.locals.runtime?.env?.SPOTIFY_CLIENT_SECRET || import.meta.env.SPOTIFY_CLIENT_SECRET;
	const spotifyUserId = context.locals.runtime?.env?.SPOTIFY_USER_ID || import.meta.env.SPOTIFY_USER_ID;

	if (!clientId || !clientSecret) {
		return json({ error: "Missing Spotify API credentials." }, 500);
	}

	if (!spotifyUserId) {
		return json({ error: "Missing Spotify user ID." }, 500);
	}

	const url = new URL(request.url);
	const count = Math.min(parseInt(url.searchParams.get("count") || "3", 10), 10);
	const cacheKey = `spotify-playlists:${spotifyUserId}`;
	const ttlMs = 10 * 60 * 1000;

	try {
		const cached = await getCachedOrFetch(cacheKey, ttlMs, async () => {
			const token = await getAccessToken(clientId, clientSecret);
			const data = await fetchSpotify(`/users/${spotifyUserId}/playlists?limit=50`, token);
			return (data.items || [])
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
		});

		const randomPlaylists = shuffleArray(cached.data).slice(0, count);

		return json({
			playlists: randomPlaylists,
			meta: {
				fromCache: cached.fromCache,
				isStaleFallback: cached.isStaleFallback,
				cachedAt: cached.cachedAt,
			},
		});
	} catch (err) {
		return json({ error: err?.message || "Failed to fetch playlists." }, 500);
	}
}
