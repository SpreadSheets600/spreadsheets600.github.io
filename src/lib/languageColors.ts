const languagePalette = ["#22d3ee", "#a78bfa", "#facc15", "#34d399", "#fb7185", "#60a5fa", "#f97316", "#e879f9"];

const languageColorMap: Record<string, string> = {
	Python: "#22d3ee",
	HTML: "#a78bfa",
	JavaScript: "#facc15",
	CSS: "#34d399",
	Vue: "#fb7185",
	TypeScript: "#60a5fa",
	Go: "#f97316",
	Rust: "#e879f9",
};

const DEFAULT_LANGUAGE_COLOR = "#94a3b8";

const hashLanguageToColor = (language: string) => {
	let hash = 0;
	for (let i = 0; i < language.length; i += 1) {
		hash = (hash * 31 + language.charCodeAt(i)) >>> 0;
	}
	return languagePalette[hash % languagePalette.length];
};

export const getLanguageColor = (language: string | null) => {
	if (!language) return DEFAULT_LANGUAGE_COLOR;
	return languageColorMap[language] ?? hashLanguageToColor(language);
};

export { languagePalette, languageColorMap, DEFAULT_LANGUAGE_COLOR };
