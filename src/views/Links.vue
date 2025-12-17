<template>
	<main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-16 flex-1">
		<header class="text-center mb-8 sm:mb-12">
			<h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-white">
				<span class="bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">Connect</span>
			</h1>
			<p class="mt-4 max-w-2xl text-white/80 mx-auto text-sm sm:text-base">Real-time activity and stats from my favorite platforms</p>
		</header>

		<!-- Social Links Section -->
		<SocialLinks />

		<!-- Status Cards Section -->
		<div>
			<h2 class="text-xl sm:text-2xl font-bold text-white/90 mb-4 sm:mb-6 flex items-center gap-2">
				<ph-activity :size="24" class="text-green-400" />
				Live Status
			</h2>
			<div class="grid gap-6 sm:gap-8 lg:grid-cols-2">
				<StatusCard title="Discord Status" :icon="discordIcon" iconColor="text-indigo-400" :loading="false" :data="{}" type="discord" />

				<StatusCard title="Steam" :icon="steamIcon" iconColor="text-sky-300" :loading="steamLoading" :data="steamData" type="steam" />

				<div class="lg:col-span-2">
					<StatusCard title="Spotify Activity" :icon="spotifyIcon" iconColor="text-green-400" :loading="spotifyLoading" :data="{ ...spotifyData, playlists: playlists }" type="spotify" />
				</div>

				<div class="lg:col-span-2">
					<StatusCard title="AniList Stats" :icon="anilistIcon" iconColor="text-pink-400" :loading="anilistLoading" :data="anilistData" type="anilist" />
				</div>
			</div>
		</div>

		<Footer />
	</main>
</template>

<script>
import { markRaw } from "vue";
import StatusCard from "../components/StatusCard.vue";
import SocialLinks from "../components/SocialLinks.vue";
import Footer from "../components/Footer.vue";
import { apiService } from "../services/api.js";
import { PhActivity, PhDiscordLogo, PhSteamLogo, PhSpotifyLogo, PhTelevision } from "@phosphor-icons/vue";

export default {
	name: "Links",
	components: {
		StatusCard,
		SocialLinks,
		Footer,
		PhActivity,
	},
	data() {
		return {
			steamLoading: true,
			spotifyLoading: true,
			anilistLoading: true,
			anilistCacheKey: "anilist_data",
			anilistCacheExpiry: 60 * 60 * 1000, // 1 hour
			steamData: null,
			spotifyData: null,
			anilistData: null,
			playlists: [],
			discordIcon: markRaw(PhDiscordLogo),
			steamIcon: markRaw(PhSteamLogo),
			spotifyIcon: markRaw(PhSpotifyLogo),
			anilistIcon: markRaw(PhTelevision),
		};
	},
	async mounted() {
		await Promise.all([this.fetchSteamData(), this.fetchSpotifyData(), this.fetchAniListData(), this.fetchPlaylists()]);
	},
	methods: {
		async fetchSpotifyData() {
			try {
				this.spotifyLoading = true;
				this.spotifyData = await apiService.getSpotifyStatus();
			} catch (error) {
				console.error("Failed to fetch Spotify data:", error);
				this.spotifyData = null;
			} finally {
				this.spotifyLoading = false;
			}
		},
		async fetchPlaylists() {
			try {
				this.playlists = await apiService.getSpotifyPlaylists();
			} catch (error) {
				console.error("Failed to fetch Spotify playlists:", error);
				this.playlists = [];
			}
		},
		async fetchSteamData() {
			try {
				this.steamLoading = true;
				this.steamData = await apiService.getSteamStatus();
			} catch (error) {
				console.error("Failed to fetch Steam data:", error);
				this.steamData = null;
			} finally {
				this.steamLoading = false;
			}
		},
		async fetchAniListData() {
			try {
				this.anilistLoading = true;

				// Check cache first
				const cached = this.getAniListFromCache();
				if (cached) {
					this.anilistData = cached;
					this.anilistLoading = false;
					return;
				}

				this.anilistData = await apiService.getAniListData("SpreadSheeets");

				// Cache the results
				this.saveAniListToCache(this.anilistData);
			} catch (error) {
				console.error("Failed to fetch AniList data:", error);
				this.anilistData = null;
			} finally {
				this.anilistLoading = false;
			}
		},
		getAniListFromCache() {
			try {
				const cached = localStorage.getItem(this.anilistCacheKey);
				if (!cached) return null;

				const { data, timestamp } = JSON.parse(cached);
				const now = Date.now();

				if (now - timestamp > this.anilistCacheExpiry) {
					localStorage.removeItem(this.anilistCacheKey);
					return null;
				}

				return data;
			} catch (error) {
				console.warn("AniList cache read error:", error);
				return null;
			}
		},
		saveAniListToCache(data) {
			try {
				const cacheData = {
					data,
					timestamp: Date.now(),
				};
				localStorage.setItem(this.anilistCacheKey, JSON.stringify(cacheData));
			} catch (error) {
				console.warn("AniList cache write error:", error);
			}
		},
	},
};
</script>
