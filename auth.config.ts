import GitHub from '@auth/core/providers/github';
import { defineConfig } from 'auth-astro';

export default defineConfig({
	providers: [
		GitHub({
			clientId: import.meta.env.GITHUB_CLIENT_ID,
			clientSecret: import.meta.env.GITHUB_CLIENT_SECRET,
		}),
	],
	callbacks: {
		async signIn({ profile }) {
			// Only allow the specific user to sign in
			return profile?.login === "SpreadSheets600";
		},
	},
});
