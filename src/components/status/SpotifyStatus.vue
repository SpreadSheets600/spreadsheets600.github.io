<template>
	<div class="w-full">
		<!-- Desktop Layout -->
		<div class="hidden lg:flex gap-4">
			<!-- Player -->
			<div class="flex-1">
				<div v-if="data && (data.is_playing || data.recently_played)" class="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-xl border border-gray-700 shadow-xl h-full">
					<div class="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden shadow-lg">
						<img v-if="data.image" :src="data.image" :alt="`${data.album} cover`" class="w-full h-full object-cover" @error="onImageError" />
					</div>

					<div class="flex-1 min-w-0 flex flex-col justify-center">
						<div class="font-bold text-white text-base truncate">{{ data.track || "Unknown Track" }}</div>
						<div class="text-gray-300 text-sm truncate">{{ data.artist || "Unknown Artist" }}</div>

						<div v-if="data.is_playing && data.duration_ms" class="mt-2 w-full">
							<div class="h-1 bg-gray-700 rounded-full overflow-hidden">
								<div class="h-full bg-green-400" :style="{ width: progressBarWidth }"></div>
							</div>
							<div class="flex justify-between text-xs text-gray-400 mt-1">
								<span>{{ formatTime(progress) }}</span>
								<span>{{ formatTime(data.duration_ms) }}</span>
							</div>
						</div>

						<div v-if="data.recently_played" class="mt-1 text-xs text-gray-400 italic">Recently Played</div>
					</div>
				</div>
				<div v-else class="flex items-center justify-between p-3 bg-gray-800 rounded-xl border border-gray-700 shadow-xl h-full">
					<div class="flex items-center gap-3">
						<ph-spotify-logo :size="20" class="text-green-500" />
						<div class="text-gray-400 text-sm">Not currently playing anything.</div>
					</div>
				</div>
			</div>

			<!-- Playlists -->
			<div class="flex gap-2">
				<a v-for="playlist in data.playlists?.slice(0, 4)" :key="playlist.name" :href="playlist.url" target="_blank" rel="noopener noreferrer" class="group relative rounded-lg overflow-hidden border border-white/10 hover:border-green-400/50 transition-all duration-300 w-28 h-28 flex-shrink-0">
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
			<!-- Player -->
			<div v-if="data && (data.is_playing || data.recently_played)" class="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-xl border border-gray-700 shadow-xl">
				<div class="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden shadow-lg">
					<img v-if="data.image" :src="data.image" :alt="`${data.album} cover`" class="w-full h-full object-cover" @error="onImageError" />
					<div v-else class="w-full h-full bg-gray-700 flex items-center justify-center">
						<ph-music-note :size="24" class="text-green-400" />
					</div>
					<div class="absolute bottom-1 right-1 p-0.5 bg-black/50 rounded-full">
						<ph-spotify-logo :size="12" class="text-green-400" />
					</div>
				</div>

				<div class="flex-1 min-w-0 flex flex-col justify-center">
					<div class="font-bold text-white text-base truncate">{{ data.track || "Unknown Track" }}</div>
					<div class="text-gray-300 text-sm truncate">{{ data.artist || "Unknown Artist" }}</div>

					<div v-if="data.is_playing && data.duration_ms" class="mt-2 w-full">
						<div class="h-1 bg-gray-700 rounded-full overflow-hidden">
							<div class="h-full bg-green-400" :style="{ width: progressBarWidth }"></div>
						</div>
						<div class="flex justify-between text-xs text-gray-400 mt-1">
							<span>{{ formatTime(progress) }}</span>
							<span>{{ formatTime(data.duration_ms) }}</span>
						</div>
					</div>

					<div v-if="data.recently_played" class="mt-1 text-xs text-gray-400 italic">Recently Played</div>
				</div>
			</div>
			<div v-else class="flex items-center justify-between p-3 bg-gray-800 rounded-xl border border-gray-700 shadow-xl">
				<div class="flex items-center gap-3">
					<ph-spotify-logo :size="20" class="text-green-500" />
					<div class="text-gray-400 text-sm">Not currently playing anything.</div>
				</div>
			</div>

			<!-- Playlists (2 rows) -->
			<div class="grid grid-cols-2 gap-3">
				<a v-for="playlist in data.playlists" :key="playlist.name" :href="playlist.url" target="_blank" rel="noopener noreferrer" class="group relative rounded-lg overflow-hidden border border-white/10 hover:border-green-400/50 transition-all duration-300 aspect-square">
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

export default {
	name: "SpotifyStatus",
	components: {
		PhMusicNote,
		PhSpotifyLogo,
	},
	props: {
		data: Object,
	},
	data() {
		return {
			progress: 0,
			interval: null,
		};
	},
	computed: {
		progressBarWidth() {
			if (!this.data.duration_ms || this.progress <= 0) return "0%";
			return `${(this.progress / this.data.duration_ms) * 100}%`;
		},
	},
	watch: {
		"data.progress_ms": {
			immediate: true,
			handler(newVal) {
				this.progress = newVal;
			},
		},
		"data.is_playing": {
			immediate: true,
			handler(isPlaying) {
				if (isPlaying) {
					this.startProgress();
				} else {
					this.stopProgress();
				}
			},
		},
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
				if (this.progress < this.data.duration_ms) {
					this.progress += 1000;
				} else {
					this.stopProgress();
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
