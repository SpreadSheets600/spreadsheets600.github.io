
import bundledColors from "../data/languageColors.json";

const languagePalette = ["#22d3ee", "#a78bfa", "#facc15", "#34d399", "#fb7185", "#60a5fa", "#f97316", "#e879f9"];

export const DEFAULT_LANGUAGE_COLOR = "#94a3b8";

const normalizeLanguage = (language: string) => language.trim().toLowerCase();

const hashLanguageToColor = (language: string) => {
	let hash = 0;

	for (let i = 0; i < language.length; i += 1) {
		hash = (hash * 31 + language.charCodeAt(i)) >>> 0;
	}

	return languagePalette[hash % languagePalette.length];
};

const colorMap: Record<string, string> = bundledColors as Record<string, string>;

export const getLanguageColorMap = async (): Promise<Record<string, string>> => {
	return colorMap;
};

export const getLanguageColorSync = (language: string | null, map?: Record<string, string>) => {
	if (!language) return DEFAULT_LANGUAGE_COLOR;
	const key = normalizeLanguage(language);
	const source = map ?? colorMap;
	return source[key] ?? hashLanguageToColor(language);
};

export const getLanguageColor = async (language: string | null) => {
	return getLanguageColorSync(language, colorMap);
};

export { languagePalette };
