<template>
	<div class="w-full">
		<!-- Desktop Layout -->
		<div class="hidden lg:flex gap-4">
			<!-- Player -->
			<div class="flex-1">
				<div v-if="spotifyData && (spotifyData.is_playing || spotifyData.recently_played)" class="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-xl border border-gray-700 shadow-xl h-full">
					<div class="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden shadow-lg">
						<img v-if="spotifyData.image" :src="spotifyData.image" :alt="`${spotifyData.album} cover`" class="w-full h-full object-cover" @error="onImageError" />
					</div>

					<div class="flex-1 min-w-0 flex flex-col justify-center">
						<div class="font-bold text-white text-base truncate">{{ spotifyData.track || "Unknown Track" }}</div>
						<div class="text-gray-300 text-sm truncate">{{ spotifyData.artist || "Unknown Artist" }}</div>

						<div v-if="spotifyData.is_playing && spotifyData.duration_ms" class="mt-2 w-full">
							<div class="h-1 bg-gray-700 rounded-full overflow-hidden">
								<div class="h-full bg-green-400" :style="{ width: progressBarWidth }"></div>
							</div>
							<div class="flex justify-between text-xs text-gray-400 mt-1">
								<span>{{ formatTime(progress) }}</span>
								<span>{{ formatTime(spotifyData.duration_ms) }}</span>
							</div>
						</div>

						<div v-if="spotifyData.recently_played" class="mt-1 text-xs text-gray-400 italic">Recently Played</div>
					</div>
				</div>
				<div v-else class="flex items-center justify-between p-3 bg-gray-800 rounded-xl border border-gray-700 shadow-xl h-full">
					<div class="flex items-center gap-3">
						<ph-spotify-logo :size="20" class="text-green-500" />
						<div class="text-gray-400 text-sm">{{ loading ? "Loading..." : "Not currently playing anything." }}</div>
					</div>
				</div>
			</div>

			<!-- Playlists -->
			<div class="flex gap-2">
				<a v-for="playlist in spotifyData?.playlists?.slice(0, 4)" :key="playlist.name" :href="playlist.url" target="_blank" rel="noopener noreferrer" class="group relative rounded-lg overflow-hidden border border-white/10 hover:border-green-400/50 transition-all duration-300 w-28 h-28 flex-shrink-0">
					<img :src="playlist.image" :alt="playlist.name" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
					<div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
					<div class="absolute bottom-0 left-0 p-1">
						<h3 class="font-semibold text-white text-xs truncate">{{ playlist.name }}</h3>
					</div>
				</a>
			</div>
		</div>

		<!-- Mobile Layout -->
		<div class="lg:hidden space-y-4">
			<div v-if="spotifyData && (spotifyData.is_playing || spotifyData.recently_played)" class="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-xl border border-gray-700 shadow-xl">
				<div class="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden shadow-lg">
					<img v-if="spotifyData.image" :src="spotifyData.image" :alt="`${spotifyData.album} cover`" class="w-full h-full object-cover" @error="onImageError" />
					<div v-else class="w-full h-full bg-gray-700 flex items-center justify-center">
						<ph-music-note :size="24" class="text-green-400" />
					</div>
					<div class="absolute bottom-1 right-1 p-0.5 bg-black/50 rounded-full">
						<ph-spotify-logo :size="12" class="text-green-400" />
					</div>
				</div>

				<div class="flex-1 min-w-0 flex flex-col justify-center">
					<div class="font-bold text-white text-base truncate">{{ spotifyData.track || "Unknown Track" }}</div>
					<div class="text-gray-300 text-sm truncate">{{ spotifyData.artist || "Unknown Artist" }}</div>

					<div v-if="spotifyData.is_playing && spotifyData.duration_ms" class="mt-2 w-full">
						<div class="h-1 bg-gray-700 rounded-full overflow-hidden">
							<div class="h-full bg-green-400" :style="{ width: progressBarWidth }"></div>
						</div>
						<div class="flex justify-between text-xs text-gray-400 mt-1">
							<span>{{ formatTime(progress) }}</span>
							<span>{{ formatTime(spotifyData.duration_ms) }}</span>
						</div>
					</div>

					<div v-if="spotifyData.recently_played" class="mt-1 text-xs text-gray-400 italic">Recently Played</div>
				</div>
			</div>
			<div v-else class="flex items-center justify-between p-3 bg-gray-800 rounded-xl border border-gray-700 shadow-xl">
				<div class="flex items-center gap-3">
					<ph-spotify-logo :size="20" class="text-green-500" />
					<div class="text-gray-400 text-sm">{{ loading ? "Loading..." : "Not currently playing anything." }}</div>
				</div>
			</div>

			<!-- Mobile Playlists -->
			<div class="grid grid-cols-2 gap-3">
				<a v-for="playlist in spotifyData?.playlists?.slice(0, 4)" :key="playlist.name" :href="playlist.url" target="_blank" rel="noopener noreferrer" class="group relative rounded-lg overflow-hidden border border-white/10 hover:border-green-400/50 transition-all duration-300 aspect-square">
					<img :src="playlist.image" :alt="playlist.name" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
					<div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
					<div class="absolute bottom-0 left-0 p-2">
						<h3 class="font-semibold text-white text-xs truncate">{{ playlist.name }}</h3>
					</div>
				</a>
			</div>
		</div>
	</div>
</template>

<script>
import { PhMusicNote, PhSpotifyLogo } from "@phosphor-icons/vue";

class SpotifyManager {
	constructor(callback) {
		this.callback = callback;
		this.cache = { data: null, timestamp: 0, isPlaying: false };

		this.sdk = null;
		this.usingSDK = false;
	}

	async init() {
		console.log("🎵 Using Spotify API");
		this.initAPI();
	}

	async initSDK() {
		try {
			await this.loadSDK();
			const token = await this.getToken();

			this.sdk = new window.Spotify.Player({
				name: "Soham Portfolio",
				getOAuthToken: (cb) => cb(token),
				volume: 0.0,
			});

			this.sdk.addListener("player_state_changed", (state) => {
				if (!state) return this.callback({ is_playing: false });

				const track = state.track_window.current_track;
				this.callback({
					is_playing: !state.paused,
					track: track.name,
					artist: track.artists[0].name,
					album: track.album.name,
					image: track.album.images[0]?.url,
					progress_ms: state.position,
					duration_ms: state.duration,
				});
			});

			this.sdk.addListener("initialization_error", ({ message }) => {
				throw new Error(`SDK init error: ${message}`);
			});

			this.sdk.addListener("authentication_error", ({ message }) => {
				throw new Error(`SDK auth error: ${message}`);
			});

			await this.sdk.connect();
		} catch (error) {
			throw error;
		}
	}

	initAPI() {
		this.fetchFromAPI();
		setInterval(() => this.fetchFromAPI(), 5000);
	}

	async fetchFromAPI() {
		const now = Date.now();
		const cacheAge = now - this.cache.timestamp;
		const maxAge = 60000;

		if (this.cache.data && cacheAge < maxAge) {
			return this.callback(this.cache.data);
		}

		try {
			const baseUrl = import.meta.env.DEV ? "http://localhost:8888/.netlify/functions" : "/.netlify/functions";

			const [trackResponse, playlistResponse] = await Promise.all([fetch(`${baseUrl}/spotify-current-track`), fetch(`${baseUrl}/spotify-playlists`)]);

			const trackData = await trackResponse.json();
			const playlists = await playlistResponse.json();

			const data = { ...trackData, playlists };

			this.cache = {
				data,
				timestamp: now,
				isPlaying: data.is_playing,
			};

			this.callback(data);
		} catch (error) {
			console.warn("API failed:", error);
			if (this.cache.data) this.callback(this.cache.data);
		}
	}

	async getToken() {
		const response = await fetch("https://accounts.spotify.com/api/token", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				Authorization: "Basic " + btoa("c935b949cfde454d8542a79b6c654b14:1f78595256fb48c98edfd7884c0e92ad"),
			},
			body: "grant_type=refresh_token&refresh_token=AQCioBzlA2O3eNeFp2e413SDb3Jw8ZjD06fQdhpdR3uu8uJx1aNENKkwFbouNyNLzY-eIOrnWjzfhlJf0ze9bv_MiMpfY4sJjwed_-PErZjLJzunIdWcfK4s2WN2sBM8XBI",
		});
		const data = await response.json();
		return data.access_token;
	}

	loadSDK() {
		return new Promise((resolve, reject) => {
			if (window.Spotify) return resolve();

			const timeout = setTimeout(() => reject(new Error("SDK timeout")), 5000);
			window.onSpotifyWebPlaybackSDKReady = () => {
				clearTimeout(timeout);
				resolve();
			};

			const script = document.createElement("script");
			script.src = "https://sdk.scdn.co/spotify-player.js";
			script.onerror = () => {
				clearTimeout(timeout);
				reject(new Error("SDK load failed"));
			};
			document.head.appendChild(script);
		});
	}
}

export default {
	name: "SpotifyStatus",
	components: { PhMusicNote, PhSpotifyLogo },
	data() {
		return {
			loading: true,
			spotifyData: null,
			progress: 0,
			interval: null,
			manager: null,
		};
	},
	computed: {
		progressBarWidth() {
			if (!this.spotifyData?.duration_ms || this.progress <= 0) return "0%";
			return `${(this.progress / this.spotifyData.duration_ms) * 100}%`;
		},
	},
	async mounted() {
		this.manager = new SpotifyManager((data) => {
			this.spotifyData = data;
			this.loading = false;
			this.progress = data.progress_ms || 0;

			if (data.is_playing) {
				this.startProgress();
			} else {
				this.stopProgress();
			}
		});

		await this.manager.init();
	},
	methods: {
		onImageError(event) {
			event.target.style.display = "none";
		},
		formatTime(ms) {
			if (!ms) return "0:00";
			const totalSeconds = Math.floor(ms / 1000);
			const minutes = Math.floor(totalSeconds / 60);
			const seconds = totalSeconds % 60;
			return `${minutes}:${seconds.toString().padStart(2, "0")}`;
		},
		startProgress() {
			this.stopProgress();
			this.interval = setInterval(() => {
				if (this.progress < this.spotifyData.duration_ms) {
					this.progress += 1000;
				}
			}, 1000);
		},
		stopProgress() {
			if (this.interval) {
				clearInterval(this.interval);
				this.interval = null;
			}
		},
	},
	beforeUnmount() {
		this.stopProgress();
	},
};
</script>
