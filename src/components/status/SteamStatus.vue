<template>
	<div v-if="data" class="grid grid-cols-1 gap-4">
		<!-- Profile Card -->
		<div class="w-full flex flex-col gap-4 p-5 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900/80 rounded-2xl border border-indigo-500/30 shadow-xl">
			<div class="flex items-center gap-4">
				<div class="relative flex-shrink-0">
					<img :src="data.avatar" :alt="data.name" class="w-20 h-20 rounded-full border-2" :class="`border-${statusColor}-500/50`" />
					<div class="absolute -bottom-1 -right-0.5 w-5 h-5 rounded-full border-4" :class="`bg-${statusColor}-500`"></div>
				</div>
				<div class="flex-1 min-w-0">
					<div class="text-xl font-bold text-white truncate">{{ data.name }}</div>
					<div v-if="lastOnline" class="text-sm text-gray-400">Last seen {{ lastOnline }}</div>
				</div>
				<a :href="data.profileUrl" target="_blank" class="px-4 py-2 rounded-full border border-indigo-400/50 bg-indigo-600/40 text-sm text-indigo-100 hover:bg-indigo-600/60 transition"> Profile </a>
			</div>

			<div v-if="data.currentlyPlaying" class="bg-indigo-900/60 rounded-lg p-4 border border-indigo-500/40">
				<div class="text-sm text-indigo-200 mb-2 font-semibold">Currently Playing</div>
				<div class="flex items-center gap-3">
					<img :src="data.currentlyPlaying.image" class="w-12 h-12 rounded-md object-cover" />
					<div class="flex-1 min-w-0">
						<div class="font-semibold text-white truncate">{{ data.currentlyPlaying.name }}</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Recent Games Card -->
		<div class="w-full flex flex-col gap-5 p-5 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900/80 rounded-2xl border border-indigo-500/30 shadow-xl">
			<div class="grid grid-cols-2 gap-4 text-center">
				<div class="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60">
					<div class="text-2xl font-bold text-white">{{ data.totalGames || 0 }}</div>
					<div class="text-xs text-gray-400">Games Owned</div>
				</div>
				<div class="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60">
					<div class="text-2xl font-bold text-white">{{ data.totalHoursPlayed || 0 }}</div>
					<div class="text-xs text-gray-400">Hours Played</div>
				</div>
			</div>
			<div v-if="data.currentlyPlaying" class="flex items-center gap-4 bg-slate-800/60 p-3 rounded-lg border border-slate-700/60">
				<img :src="data.currentlyPlaying.image" :alt="data.currentlyPlaying.name" class="w-24 h-12 object-cover rounded-md flex-shrink-0" />
				<div class="flex-1 min-w-0">
					<div class="font-semibold text-white truncate">{{ data.currentlyPlaying.name }}</div>
				</div>
				<span class="px-2 py-1 rounded-full bg-green-600/40 text-green-100 text-xs font-semibold">Playing Now</span>
			</div>
			<div v-else-if="data.recentGames && data.recentGames.length" class="space-y-3">
				<div v-for="game in data.recentGames.slice(0, 1)" :key="game.appId" class="flex items-center gap-4 bg-slate-800/60 p-3 rounded-lg border border-slate-700/60">
					<img :src="game.header" :alt="game.name" class="w-24 h-12 object-cover rounded-md flex-shrink-0" />
					<div class="flex-1 min-w-0">
						<div class="font-semibold text-white truncate">{{ game.name }}</div>
						<div class="text-xs text-gray-400">{{ formatHours(game.playtime2Weeks) }} in last 2 weeks</div>
					</div>
				</div>
			</div>
			<div v-else class="text-center text-gray-500 py-8">No recent game activity</div>
		</div>
	</div>
	<div v-else class="flex items-center justify-between p-5 bg-gray-800 rounded-2xl border border-gray-700">
		<div class="flex items-center gap-4">
			<ph-steam-logo :size="32" class="text-indigo-400" />
			<div class="text-gray-400">Steam status unavailable.</div>
		</div>
	</div>
</template>

<script>
import { formatDistanceToNow } from "date-fns";
import { PhSteamLogo } from "@phosphor-icons/vue";

export default {
	name: "SteamStatus",
	components: {
		PhSteamLogo,
	},
	props: {
		data: Object,
	},
	computed: {
		statusColor() {
			const map = {
				online: "green",
				busy: "red",
				away: "yellow",
				snooze: "orange",
				"looking to trade": "blue",
				"looking to play": "blue",
				offline: "gray",
			};
			return map[this.data?.status] || "gray";
		},
		lastOnline() {
			if (!this.data || !this.data.lastLogoff) return null;
			if (this.data.status !== "offline") return this.data.status;
			return formatDistanceToNow(new Date(this.data.lastLogoff), { addSuffix: true });
		},
		recentGamesCardTitle() {
			if (this.data?.currentlyPlaying) {
				return "Playing Now";
			}
			return "Recently Played";
		},
	},
	methods: {
		formatHours(minutes) {
			if (!minutes) return "0h";
			const hours = minutes / 60;
			return hours >= 10 ? `${Math.round(hours)}h` : `${hours.toFixed(1)}h`;
		},
	},
};
</script>
