const languagePalette = ["#22d3ee", "#a78bfa", "#facc15", "#34d399", "#fb7185", "#60a5fa", "#f97316", "#e879f9"];

const GITHUB_COLORS_URL = "https://raw.githubusercontent.com/ozh/github-colors/master/colors.json";

const DEFAULT_LANGUAGE_COLOR = "#94a3b8";

let cachedLanguageColorMap: Record<string, string> | null = null;
let colorMapPromise: Promise<Record<string, string>> | null = null;

const normalizeLanguage = (language: string) => language.trim().toLowerCase();

const hashLanguageToColor = (language: string) => {
	let hash = 0;

	for (let i = 0; i < language.length; i += 1) {
		hash = (hash * 31 + language.charCodeAt(i)) >>> 0;
	}

	return languagePalette[hash % languagePalette.length];
};

const parseGitHubColors = (raw: unknown): Record<string, string> => {
	if (!raw || typeof raw !== "object") return {};

	const normalized: Record<string, string> = {};
	for (const [language, value] of Object.entries(raw as Record<string, { color?: string }>)) {
		const color = value?.color;

		if (!color || typeof color !== "string") continue;
		if (!color.startsWith("#")) continue;

		normalized[normalizeLanguage(language)] = color;
	}
	return normalized;
};

export const getLanguageColorMap = async (): Promise<Record<string, string>> => {
	if (cachedLanguageColorMap) return cachedLanguageColorMap;
	if (colorMapPromise) return colorMapPromise;

	colorMapPromise = (async () => {
		try {
			const response = await fetch(GITHUB_COLORS_URL, {
				headers: {
					Accept: "application/json",
				},
			});
			if (!response.ok) return {};

			const payload = await response.json();
			const parsedColors = parseGitHubColors(payload);

			return parsedColors;
		} catch {
			return {};
		}
	})();

	const resolved = await colorMapPromise;

	cachedLanguageColorMap = resolved;
	colorMapPromise = null;

	return resolved;
};

export const getLanguageColorSync = (language: string | null, colorMap?: Record<string, string>) => {
	if (!language) return DEFAULT_LANGUAGE_COLOR;

	const mappedColor = colorMap?.[normalizeLanguage(language)];
	return mappedColor ?? hashLanguageToColor(language);
};

export const getLanguageColor = async (language: string | null) => {
	if (!language) return DEFAULT_LANGUAGE_COLOR;

	const colorMap = await getLanguageColorMap();
	return getLanguageColorSync(language, colorMap);
};

export { languagePalette, DEFAULT_LANGUAGE_COLOR };
