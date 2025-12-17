<template>
	<div class="rounded-xl sm:rounded-2xl border border-white/10 bg-black/30 p-4 sm:p-6 backdrop-blur-xl">
		<div class="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
			<component :is="icon" :size="20" :class="iconColor" class="sm:w-6 sm:h-6" />
			<h2 class="text-lg sm:text-xl font-semibold">{{ title }}</h2>
		</div>

		<div v-if="loading" class="text-center text-white/60">
			<div class="animate-pulse text-sm sm:text-base">Loading {{ title.toLowerCase() }}...</div>
		</div>

		<div v-else>
			<DiscordStatus v-if="type === 'discord'" :data="data" />
			<SpotifyStatus v-else-if="type === 'spotify'" :data="data" />
			<AniListStatus v-else-if="type === 'anilist'" :data="data" />
			<SteamStatus v-else-if="type === 'steam'" :data="data" />
		</div>
	</div>
</template>

<script>
import DiscordStatus from "./status/DiscordStatus.vue";
import SpotifyStatus from "./status/SpotifyStatus.vue";
import AniListStatus from "./status/AniListStatus.vue";
import SteamStatus from "./status/SteamStatus.vue";

export default {
	name: "StatusCard",
	components: {
		DiscordStatus,
		SpotifyStatus,
		AniListStatus,
		SteamStatus,
	},
	props: {
		title: String,
		icon: Object,
		iconColor: String,
		loading: Boolean,
		data: Object,
		type: String,
	},
};
</script>
