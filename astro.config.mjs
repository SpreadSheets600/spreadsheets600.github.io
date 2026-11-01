import { defineConfig } from "astro/config";

import tailwind from "@astrojs/tailwind";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
	output: "server",
	prefetch: { prefetchAll: true, defaultStrategy: "hover" },
	integrations: [
		tailwind(),
	],

	adapter: cloudflare({
		imageService: 'passthrough',
		platformProxy: {
			enabled: true,
		},
	}),
});
