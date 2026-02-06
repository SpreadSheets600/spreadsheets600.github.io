import { defineConfig } from "astro/config";

import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
	output: "server",
	integrations: [mdx(), tailwind()],

	adapter: cloudflare({
		platformProxy: {
			enabled: true,
		},
	}),
});
