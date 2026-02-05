import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  output: "server",
  integrations: [mdx()],
  adapter: cloudflare(),
});
