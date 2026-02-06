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
