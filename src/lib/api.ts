/**
 * Single client for the SpreadSheets600 profile API.
 *
 * `/snapshot` carries GitHub, WakaTime, Steam, Spotify, AniList and Discord data, so every
 * widget on the site subscribes here instead of calling its own endpoint. One request is
 * shared by all widgets on a page, the last good response is kept in localStorage so repeat
 * visits paint instantly (stale-while-revalidate), and the data refreshes in the background
 * while the tab is visible.
 */

export const API_BASE: string = (import.meta.env.PUBLIC_API_BASE as string | undefined) || "https://spreadsheets600-api-io.spreadsheets600.workers.dev";

export interface Source<T = any> {
	ok: boolean;
	data: T | null;
	error?: string;
}

export interface Snapshot {
	generatedAt: string;
	github: Source;
	wakatime: Source;
	steam: Source;
	spotify: Source;
	anilist: Source;
	discord: Source;
}

export interface SnapshotMeta {
	/** true while showing cached data that has not been revalidated yet (or a refresh failed) */
	stale: boolean;
	/** true when the last network attempt failed */
	error: boolean;
	/** ms timestamp of the last successful network fetch, 0 if none this session */
	fetchedAt: number;
}

export type SnapshotListener = (snapshot: Snapshot | null, meta: SnapshotMeta) => void;

const STORAGE_KEY = "s600:snapshot:v1";
const POLL_MS = 120_000;
const TIMEOUT_MS = 25_000;
/** Cached data older than this is ignored instead of shown as a placeholder. */
const MAX_CACHE_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const listeners = new Set<SnapshotListener>();

let current: Snapshot | null = null;
let meta: SnapshotMeta = { stale: true, error: false, fetchedAt: 0 };
let inflight: Promise<void> | null = null;
let started = false;
let settled = false;

const notify = () => {
	for (const listener of listeners) {
		try {
			listener(current, meta);
		} catch (error) {
			console.error("snapshot listener failed", error);
		}
	}
};

const readCache = (): Snapshot | null => {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as { at: number; data: Snapshot };
		if (!parsed?.data || Date.now() - parsed.at > MAX_CACHE_AGE_MS) return null;
		return parsed.data;
	} catch {
		return null;
	}
};

const writeCache = (data: Snapshot) => {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify({ at: Date.now(), data }));
	} catch {
		// Storage can be full (the AniList covers are inline images) or blocked; the page works without it.
	}
};

export function refresh(force = false): Promise<void> {
	if (inflight) return inflight;

	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

	inflight = fetch(`${API_BASE}/snapshot`, {
		signal: controller.signal,
		// Background polls ask the edge to revalidate; the first load may use the browser cache.
		cache: force || meta.fetchedAt ? "no-cache" : "default",
	})
		.then(async (response) => {
			if (!response.ok) throw new Error(`snapshot responded ${response.status}`);
			const data = (await response.json()) as Snapshot;
			current = data;
			meta = { stale: false, error: false, fetchedAt: Date.now() };
			writeCache(data);
		})
		.catch((error) => {
			console.warn("snapshot refresh failed", error);
			meta = { ...meta, stale: true, error: true };
		})
		.finally(() => {
			clearTimeout(timer);
			inflight = null;
			settled = true;
			notify();
		});

	return inflight;
}

const start = () => {
	if (started) return;
	started = true;

	const cached = readCache();
	if (cached) {
		current = cached;
		notify();
	}

	void refresh();

	setInterval(() => {
		if (document.visibilityState === "visible") void refresh();
	}, POLL_MS);

	document.addEventListener("visibilitychange", () => {
		if (document.visibilityState === "visible" && Date.now() - meta.fetchedAt > POLL_MS / 2) void refresh();
	});
};

/**
 * Subscribe to snapshot updates. The listener is called right away with whatever is known
 * (cached data, or `null` once a first load has failed) and again after every refresh.
 */
export function onSnapshot(listener: SnapshotListener): () => void {
	listeners.add(listener);
	if (current || settled) {
		try {
			listener(current, meta);
		} catch (error) {
			console.error("snapshot listener failed", error);
		}
	}
	start();
	return () => listeners.delete(listener);
}

/** Convenience: the `data` of one source if it loaded, otherwise null. */
export function pick<K extends keyof Omit<Snapshot, "generatedAt">>(snapshot: Snapshot | null, key: K): any | null {
	const source = snapshot?.[key];
	return source?.ok ? (source.data ?? null) : null;
}

export const snapshotTime = (snapshot: Snapshot | null): number => (snapshot?.generatedAt ? Date.parse(snapshot.generatedAt) : 0);

/** Wallpaper for the page background, chosen by the API from the Wallpapers repo. */
export async function fetchWallpaper(): Promise<string | null> {
	try {
		const response = await fetch(`${API_BASE}/header?format=json`);
		if (!response.ok) return null;
		const body = (await response.json()) as { url?: string };
		return body.url ?? null;
	} catch {
		return null;
	}
}
