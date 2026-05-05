import { defineConfig } from "astro/config";

import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";
import cloudflare from "@astrojs/cloudflare";
import remarkGfm from "remark-gfm";

export default defineConfig({
	output: "server",
	integrations: [
		mdx({
			remarkPlugins: [remarkGfm],
		}),
		tailwind(),
	],

	adapter: cloudflare({
		imageService: 'passthrough',
		platformProxy: {
			enabled: true,
		},
	}),
});
