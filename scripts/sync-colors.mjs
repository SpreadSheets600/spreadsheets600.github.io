/**
 * Syncs GitHub language colors to a local static JSON file.
 * Run before building: npm run sync-colors
 *
 * Cloudflare Workers cannot do module-level fetch() side effects reliably
 * across cold starts, so we bundle the colors at build time instead.
 */

import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const COLORS_URL = "https://raw.githubusercontent.com/ozh/github-colors/master/colors.json";
const OUTPUT_PATH = join(__dirname, "../src/data/languageColors.json");

async function main() {
	console.log("⬇️  Fetching GitHub language colors...");
	const res = await fetch(COLORS_URL);
	if (!res.ok) {
		console.error(`❌ Failed to fetch: ${res.status} ${res.statusText}`);
		process.exit(1);
	}

	const raw = await res.json();

	// Normalize: lowercase keys, only keep entries with valid hex colors
	const normalized = {};
	for (const [language, value] of Object.entries(raw)) {
		const color = value?.color;
		if (color && typeof color === "string" && color.startsWith("#")) {
			normalized[language.trim().toLowerCase()] = color;
		}
	}

	mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
	writeFileSync(OUTPUT_PATH, JSON.stringify(normalized, null, 2), "utf-8");

	const count = Object.keys(normalized).length;
	console.log(`✅  Saved ${count} language colors to src/data/languageColors.json`);
}

main().catch((err) => {
	console.error("❌ sync-colors failed:", err);
	process.exit(1);
});
