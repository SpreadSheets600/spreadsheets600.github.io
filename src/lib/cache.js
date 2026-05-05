// NOTE: Cloudflare Workers run in V8 isolates that are ephemeral — each request
// may get a fresh isolate, so this Map does NOT persist across requests in
// production. It still de-duplicates calls within a single request invocation.
// For durable cross-request caching, bind a Cloudflare KV namespace in wrangler.toml.
const store = new Map();

function now() {
	return Date.now();
}

export function getCache(key) {
	const entry = store.get(key);
	if (!entry) return null;

	const isFresh = now() < entry.expiresAt;
	return {
		value: entry.value,
		isFresh,
		updatedAt: entry.updatedAt,
	};
}

export function setCache(key, value, ttlMs) {
	const timestamp = now();
	store.set(key, {
		value,
		updatedAt: timestamp,
		expiresAt: timestamp + ttlMs,
	});
}

export async function getCachedOrFetch(key, ttlMs, fetcher) {
	const cached = getCache(key);
	if (cached?.isFresh) {
		return {
			data: cached.value,
			fromCache: true,
			isStaleFallback: false,
			cachedAt: cached.updatedAt,
		};
	}

	try {
		const data = await fetcher();
		setCache(key, data, ttlMs);
		return {
			data,
			fromCache: false,
			isStaleFallback: false,
			cachedAt: Date.now(),
		};
	} catch (error) {
		if (cached?.value) {
			return {
				data: cached.value,
				fromCache: true,
				isStaleFallback: true,
				cachedAt: cached.updatedAt,
				error,
			};
		}
		throw error;
	}
}
