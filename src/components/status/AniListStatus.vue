<template>
	<div v-if="data && data.User" class="space-y-4">
		<div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
			<!-- Stats Column -->
			<div class="lg:col-span-2 space-y-4">
				<div class="flex items-center justify-between p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
					<h2 class="text-xl sm:text-2xl font-extrabold text-white">{{ data.User.name }}</h2>
					<a :href="data.User.siteUrl" target="_blank" rel="noopener noreferrer" class="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-blue-200 bg-blue-500/20 border border-blue-400/50 rounded-lg sm:rounded-xl hover:bg-blue-500/30 transition"> View Profile </a>
				</div>
				<div class="bg-white/5 rounded-xl border border-white/10 p-2 sm:p-3 backdrop-blur">
					<h3 class="text-base sm:text-lg font-bold text-white flex items-center gap-2 mb-3 sm:mb-4">
						<ph-television :size="18" class="text-blue-400" />
						Anime Stats
					</h3>
					<div class="grid grid-cols-2 gap-3 sm:gap-4 text-sm text-center">
						<div>
							<div class="text-white/50 text-xs sm:text-sm">Anime</div>
							<div class="text-xl sm:text-2xl font-semibold text-white">{{ data.User.statistics.anime.count || 0 }}</div>
						</div>
						<div>
							<div class="text-white/50 text-xs sm:text-sm">Episodes</div>
							<div class="text-xl sm:text-2xl font-semibold text-white">{{ data.User.statistics.anime.episodesWatched || 0 }}</div>
						</div>
						<div>
							<div class="text-white/50 text-xs sm:text-sm">Mean Score</div>
							<div class="text-xl sm:text-2xl font-semibold text-white">{{ data.User.statistics.anime.meanScore || 0 }}</div>
						</div>
						<div>
							<div class="text-white/50 text-xs sm:text-sm">Time Watched</div>
							<div class="text-xl sm:text-2xl font-semibold text-white">{{ Math.round((data.User.statistics.anime.minutesWatched || 0) / 60 / 24) }} Days</div>
						</div>
					</div>
				</div>

				<div class="bg-white/5 rounded-xl border border-white/10 p-2 sm:p-3 backdrop-blur">
					<h3 class="text-base sm:text-lg font-bold text-white flex items-center gap-2 mb-3 sm:mb-4">
						<ph-book :size="18" class="text-pink-400" />
						Manga Stats
					</h3>
					<div class="grid grid-cols-2 gap-3 sm:gap-4 text-sm text-center">
						<div>
							<div class="text-white/50 text-xs sm:text-sm">Manga</div>
							<div class="text-xl sm:text-2xl font-semibold text-white">{{ data.User.statistics.manga.count || 0 }}</div>
						</div>
						<div>
							<div class="text-white/50 text-xs sm:text-sm">Volumes</div>
							<div class="text-xl sm:text-2xl font-semibold text-white">{{ data.User.statistics.manga.volumesRead || 0 }}</div>
						</div>
						<div>
							<div class="text-white/50 text-xs sm:text-sm">Chapters</div>
							<div class="text-xl sm:text-2xl font-semibold text-white">{{ data.User.statistics.manga.chaptersRead || 0 }}</div>
						</div>
						<div>
							<div class="text-white/50 text-xs sm:text-sm">Mean Score</div>
							<div class="text-xl sm:text-2xl font-semibold text-white">{{ data.User.statistics.manga.meanScore || 0 }}</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Latest Anime -->
			<div class="rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-3 sm:p-4">
				<h3 class="text-base sm:text-lg font-bold text-white mb-2 sm:mb-3">Latest Anime</h3>
				<div v-if="latestAnime">
					<a :href="latestAnime.media.siteUrl" target="_blank" rel="noopener noreferrer" class="block group">
						<div class="aspect-[2/3] w-full mb-2 sm:mb-3 overflow-hidden rounded-lg sm:rounded-xl border border-white/10">
							<img :src="latestAnime.media.coverImage.large" :alt="latestAnime.media.title.english || latestAnime.media.title.romaji" class="w-full h-full object-cover transition duration-300 group-hover:scale-105" />
						</div>
						<div class="font-semibold text-white text-sm sm:text-base truncate">{{ latestAnime.media.title.english || latestAnime.media.title.romaji || "-" }}</div>
						<div class="text-xs text-white/60 mt-1">{{ latestAnime.status }} • {{ latestAnime.media.format }}</div>
					</a>
				</div>
				<div v-else class="text-sm text-white/60">No Recent Anime Activity</div>
			</div>

			<!-- Latest Manga -->
			<div class="rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-3 sm:p-4">
				<h3 class="text-base sm:text-lg font-bold text-white mb-2 sm:mb-3">Latest Manga</h3>
				<div v-if="latestManga">
					<a :href="latestManga.media.siteUrl" target="_blank" rel="noopener noreferrer" class="block group">
						<div class="aspect-[2/3] w-full mb-2 sm:mb-3 overflow-hidden rounded-lg sm:rounded-xl border border-white/10">
							<img :src="latestManga.media.coverImage.large" :alt="latestManga.media.title.english || latestManga.media.title.romaji" class="w-full h-full object-cover transition duration-300 group-hover:scale-105" />
						</div>
						<div class="font-semibold text-white text-sm sm:text-base truncate">{{ latestManga.media.title.english || latestManga.media.title.romaji || "-" }}</div>
						<div class="text-xs text-white/60 mt-1">{{ latestManga.status }} • {{ latestManga.media.format }}</div>
					</a>
				</div>
				<div v-else class="text-sm text-white/60">No Recent Manga Activity</div>
			</div>
		</div>
	</div>
	<div v-else class="flex items-center justify-between p-4 sm:p-5 bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-700">
		<div class="text-gray-400 text-sm sm:text-base">AniList stats unavailable.</div>
		<ph-television :size="24" class="text-pink-400/50" />
	</div>
</template>

<script>
import { PhTelevision, PhBook } from "@phosphor-icons/vue";

export default {
	name: "AniListStatus",
	components: {
		PhTelevision,
		PhBook,
	},
	props: {
		data: Object,
	},
	computed: {
		latestAnime() {
			return this.data?.latestAnime?.activities?.[0] || null;
		},
		latestManga() {
			return this.data?.latestManga?.activities?.[0] || null;
		},
	},
};
</script>
