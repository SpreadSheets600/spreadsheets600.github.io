<template>
	<div class="w-full space-y-4">
		<div v-if="loading" class="flex items-center justify-center space-x-3 py-12 bg-gray-900/60 rounded-2xl border border-gray-800">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
			<span class="text-gray-300 text-lg">Connecting to Discord...</span>
		</div>

		<div v-else-if="error" class="text-center py-12 bg-gray-900/60 rounded-2xl border border-gray-800">
			<div class="text-red-400 flex flex-col items-center justify-center space-y-3">
				<ph-warning-circle :size="48" />
				<span class="text-xl font-semibold">Discord unavailable</span>
				<p class="text-gray-400 text-sm">Could not connect to Lanyard API.</p>
			</div>
			<button @click="fetchUserData" class="mt-6 text-blue-400 hover:text-blue-300 text-sm underline transition-colors">Try again</button>
		</div>

		<div v-else-if="presence" class="space-y-4">
			<div class="grid gap-4">
				<!-- Profile Card -->
				<div class="w-full bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-800/70 rounded-2xl border border-gray-800 shadow-2xl p-5 flex flex-col gap-4">
					<div class="flex items-center gap-4">
						<div class="relative flex-shrink-0">
							<div class="relative w-20 h-20">
								<img v-if="images.avatarDecoration" :src="images.avatarDecoration" class="absolute inset-0 w-full h-full pointer-events-none z-10 scale-[1.25]" />
								<img v-if="images.avatar" :src="images.avatar" :alt="presence.discord_user.display_name" class="absolute inset-0 w-full h-full rounded-full object-cover ring-2 ring-offset-2 ring-offset-gray-900" :class="`ring-${statusColor}-500/60`" />
							</div>

							<div class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-gray-900 z-30" :class="`bg-${statusColor}-500`"></div>
						</div>
						<div class="flex-1 min-w-0 space-y-1">
							<div class="flex items-center gap-2 flex-wrap">
								<h3 class="text-white font-bold text-2xl truncate">{{ presence.discord_user.display_name }}</h3>
								<div v-if="presence.discord_user.primary_guild?.tag" class="flex items-center space-x-1 bg-purple-600/40 text-white text-xs px-2 py-1 rounded-full border border-purple-500/60">
									<img v-if="images.clanBadge" :src="images.clanBadge" class="w-4 h-4" />
									<span>{{ presence.discord_user.primary_guild.tag }}</span>
								</div>
							</div>
							<p class="text-gray-400 text-base truncate">{{ presence.discord_user.username }}</p>
						</div>
					</div>
				</div>

				<!-- Activity Card -->
				<div class="w-full bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-800/70 rounded-2xl border border-gray-800 shadow-2xl p-5 flex flex-col gap-4">
					<div v-if="customStatus" class="bg-gray-800/70 rounded-lg p-3 border border-gray-700/70 text-center">
						<p class="text-gray-200 text-sm flex items-center justify-center gap-2">
							<span v-if="customStatus.emoji" class="text-lg">{{ customStatus.emoji.name }}</span>
							<span class="truncate">{{ customStatus.state }}</span>
						</p>
					</div>

					<div v-if="activities.length" class="space-y-3">
						<div v-for="activity in activities" :key="activity.id" class="bg-gray-800/70 rounded-lg p-4 border border-gray-700/70 flex items-center gap-4">
							<div class="flex-shrink-0 relative">
								<img v-if="images.assetLargeImage && mainActivity?.id === activity.id" :src="images.assetLargeImage" class="w-16 h-16 rounded-lg object-cover" :alt="activity.name" />
								<component v-else :is="getActivityIcon(activity.type).component" :weight="getActivityIcon(activity.type).weight" :size="32" class="text-blue-400 w-14 text-center" />
								<img v-if="images.assetSmallImage && mainActivity?.id === activity.id" :src="images.assetSmallImage" class="w-6 h-6 rounded-full absolute -bottom-2 -right-2 border-2 border-gray-800" />
							</div>
							<div class="min-w-0 space-y-1">
								<p class="text-white font-semibold truncate">{{ activity.name }}</p>
								<p v-if="activity.details" class="text-gray-300 text-sm truncate">{{ activity.details }}</p>
								<p v-if="activity.timestamps?.start" class="text-xs text-gray-500">{{ formatTime(activity.timestamps.start).value }} elapsed</p>
							</div>
						</div>
					</div>

					<div v-else class="text-gray-500 text-sm bg-gray-800/60 border border-gray-700/60 rounded-lg p-4 text-center">No active sessions.</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, watchEffect, onMounted, onUnmounted } from "vue";
import { useLanyard } from "@/services/useLanyard.js";
import { decodeUserFlags, fetchUserImages } from "@/utils/imageUtils.js";
import { PhWarningCircle, PhDeviceMobile, PhDesktopTower, PhGlobe, PhGameController, PhBroadcast, PhMusicNote, PhTelevision, PhTrophy, PhCircle } from "@phosphor-icons/vue";

const { presence, loading, error, wsConnected, fetchUserData } = useLanyard();

const images = ref({});
const badges = ref([]);
const currentTime = ref(Date.now());

let intervalId;

onMounted(() => {
	intervalId = setInterval(() => {
		currentTime.value = Date.now();
	}, 1000);
});

onUnmounted(() => {
	clearInterval(intervalId);
});

watchEffect(async () => {
	if (presence.value) {
		images.value = await fetchUserImages(presence.value);
		if (presence.value.discord_user.public_flags) {
			badges.value = decodeUserFlags(presence.value.discord_user.public_flags);
		}
	}
});

const statusColor = computed(() => {
	if (!presence.value) return "gray";
	const status = presence.value.discord_status;
	const colorMap = {
		online: "green",
		idle: "yellow",
		dnd: "red",
		offline: "gray",
	};
	return colorMap[status] || "gray";
});

const customStatus = computed(() => {
	return presence.value?.activities?.find((a) => a.type === 4);
});

const mainActivity = computed(() => {
	return presence.value?.activities?.find((a) => a.type === 0);
});

const activities = computed(() => {
	return presence.value?.activities?.filter((a) => a.type !== 4 && a.name !== "Spotify") || [];
});

const deviceStatus = computed(() => {
	if (!presence.value) return "";
	if (presence.value.active_on_discord_desktop) return "Discord Desktop";
	if (presence.value.active_on_discord_mobile) return "Discord Mobile";
	if (presence.value.active_on_discord_web) return "Discord Web";
	return "";
});

const getActivityIcon = (type) => {
	const icons = {
		0: { component: PhGameController, weight: "fill" },
		1: { component: PhBroadcast, weight: "fill" },
		2: { component: PhMusicNote, weight: "fill" },
		3: { component: PhTelevision, weight: "fill" },
		5: { component: PhTrophy, weight: "fill" },
	};
	return icons[type] || { component: PhCircle, weight: "fill" };
};

const formatTime = (timestamp) => {
	return computed(() => {
		const start = new Date(timestamp);
		const diff = currentTime.value - start.getTime();
		const hours = Math.floor(diff / (1000 * 60 * 60))
			.toString()
			.padStart(2, "0");
		const minutes = Math.floor((diff / (1000 * 60)) % 60)
			.toString()
			.padStart(2, "0");
		const seconds = Math.floor((diff / 1000) % 60)
			.toString()
			.padStart(2, "0");
		return `${hours}:${minutes}:${seconds}`;
	});
};

const vTooltip = {
	mounted(el, binding) {
		el.setAttribute("data-tooltip", binding.value);
		el.classList.add("tooltip");
	},
	unmounted(el) {
		el.removeAttribute("data-tooltip");
		el.classList.remove("tooltip");
	},
};
</script>

<style>
.tooltip {
	position: relative;
}
.tooltip:before {
	content: attr(data-tooltip);
	position: absolute;
	bottom: 125%;
	left: 50%;
	transform: translateX(-50%);
	padding: 6px 10px;
	background-color: #1f2937;
	color: #d1d5db;
	border-radius: 6px;
	font-size: 0.875rem;
	white-space: nowrap;
	opacity: 0;
	visibility: hidden;
	transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out;
	z-index: 10;
}
.tooltip:hover:before {
	opacity: 1;
	visibility: visible;
}
</style>
