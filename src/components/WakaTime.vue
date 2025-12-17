<template>
	<section id="wakatime" class="scroll-mt-24 mt-8 sm:mt-12">
		<div class="mb-4 sm:mb-6 flex items-center justify-between gap-4">
			<h2 class="text-xl sm:text-2xl font-semibold">Coding Stats</h2>
		</div>

		<div class="grid gap-3 sm:gap-4 sm:grid-cols-3">
			<div class="rounded-xl sm:rounded-2xl border border-white/10 bg-black/30 p-4 sm:p-5 backdrop-blur-xl">
				<p class="text-xs uppercase tracking-wider text-white/60">Total</p>
				<p class="mt-2 text-xl sm:text-2xl font-semibold">{{ stats.total || "—" }}</p>
				<p class="mt-1 text-xs text-white/50">{{ stats.range || "—" }}</p>
			</div>
			<div class="rounded-xl sm:rounded-2xl border border-white/10 bg-black/30 p-4 sm:p-5 backdrop-blur-xl">
				<p class="text-xs uppercase tracking-wider text-white/60">Daily Average</p>
				<p class="mt-2 text-xl sm:text-2xl font-semibold">{{ stats.daily || "—" }}</p>
				<p class="mt-1 text-xs text-white/50">Across Last Week</p>
			</div>
			<div class="rounded-xl sm:rounded-2xl border border-white/10 bg-black/30 p-4 sm:p-5 backdrop-blur-xl">
				<p class="text-xs uppercase tracking-wider text-white/60">Today's Stats</p>
				<p class="mt-2 text-xl sm:text-2xl font-semibold leading-snug">{{ stats.latest || "—" }}</p>
				<p class="mt-1 text-xs text-white/50">{{ stats.latestDate || "—" }}</p>
			</div>
		</div>

		<div class="mt-4 sm:mt-6 grid gap-4 sm:gap-6 lg:grid-cols-3">
			<div class="rounded-xl sm:rounded-2xl border border-white/10 bg-black/30 p-4 sm:p-6 backdrop-blur-xl">
				<h3 class="text-base sm:text-lg font-semibold">Operating System</h3>
				<div class="mt-3 sm:mt-4 grid gap-2 sm:gap-3">
					<div v-for="os in stats.oses" :key="os.name" class="grid gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
						<div class="flex items-center justify-between text-sm">
							<span class="text-white/90 truncate">{{ os.name }}</span>
							<span class="text-white/70 flex-shrink-0 ml-2">{{ os.text }}</span>
						</div>
						<div class="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
							<div class="h-full rounded-full bg-white/70" :style="{ width: `${os.percent}%` }"></div>
						</div>
					</div>
				</div>
			</div>

			<div class="rounded-xl sm:rounded-2xl border border-white/10 bg-black/30 p-4 sm:p-6 backdrop-blur-xl">
				<h3 class="text-base sm:text-lg font-semibold">Top Languages</h3>
				<div class="mt-3 sm:mt-4 grid gap-2 sm:gap-3">
					<div v-for="lang in stats.langs" :key="lang.name" class="grid gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
						<div class="flex items-center justify-between text-sm">
							<span class="text-white/90 truncate">{{ lang.name }}</span>
							<span class="text-white/70 flex-shrink-0 ml-2">{{ lang.text }}</span>
						</div>
						<div class="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
							<div class="h-full rounded-full bg-white/70" :style="{ width: `${lang.percent}%` }"></div>
						</div>
					</div>
				</div>
			</div>

			<div class="rounded-xl sm:rounded-2xl border border-white/10 bg-black/30 p-4 sm:p-6 backdrop-blur-xl">
				<h3 class="text-base sm:text-lg font-semibold">Code Editor</h3>
				<div class="mt-3 sm:mt-4 grid gap-2 sm:gap-3">
					<div v-for="editor in stats.editors" :key="editor.name" class="grid gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
						<div class="flex items-center justify-between text-sm">
							<span class="text-white/90">{{ editor.name }}</span>
							<span class="text-white/70">{{ editor.text }}</span>
						</div>
						<div class="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
							<div class="h-full rounded-full bg-white/70" :style="{ width: `${editor.percent}%` }"></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>

<script>
export default {
	name: "WakaTime",
	data() {
		return {
			stats: {
				total: "—",
				daily: "—",
				latest: "—",
				latestDate: "—",
				range: "—",
				oses: [],
				langs: [],
				editors: [],
			},
		};
	},
	async mounted() {
		await this.loadWakaTimeData();
	},
	methods: {
		async loadWakaTimeData() {
			try {
				const urls = {
					operating_systems: "https://wakatime.com/share/@SpreadSheets600/d3bada79-4d56-4544-8240-c9c6ff7a669d.json",
					coding_activity: "https://wakatime.com/share/@SpreadSheets600/6f79156a-5f87-43a8-9a05-0edd976b8c9a.json",
					languages: "https://wakatime.com/share/@SpreadSheets600/322b4068-62e5-430c-bfa2-cc92e8f7e7e3.json",
					editors: "https://wakatime.com/share/@SpreadSheets600/d13c536f-1f9d-40a6-8bd5-ec5902652383.json",
					current: "https://wakatime.com/share/@SpreadSheets600/9ce6920b-5ae7-4f33-90fd-f18d82f3aeb9.json",
				};

				const [osRes, activityRes, langsRes, editorsRes, currentRes] = await Promise.all(Object.values(urls).map((url) => fetch(url).then((r) => r.json())));

				if (activityRes.data) {
					this.stats.total = activityRes.data.grand_total?.human_readable_total_including_other_language || "—";
					this.stats.daily = activityRes.data.grand_total?.human_readable_daily_average_including_other_language || "—";
					this.stats.range = `From ${new Date(activityRes.data.range.start).toLocaleDateString()} To ${new Date(activityRes.data.range.end).toLocaleDateString()}`;
				}

				if (currentRes.data) {
					if (Array.isArray(currentRes.data)) {
						const today = new Date().toISOString().slice(0, 10);
						const todayObj = currentRes.data.find((d) => d.range?.date === today);
						if (todayObj?.grand_total) {
							this.stats.latest = todayObj.grand_total.text || "—";
							this.stats.latestDate = todayObj.range?.text || today;
						}
					} else {
						this.stats.latest = currentRes.data.text || "—";
						this.stats.latestDate = currentRes.data.date ? new Date(currentRes.data.date).toLocaleDateString() : "—";
					}
				}

				this.stats.oses = (osRes.data || []).slice(0, 5);
				this.stats.langs = (langsRes.data || []).slice(0, 5);
				this.stats.editors = (editorsRes.data || []).slice(0, 5);
			} catch (error) {
				console.error("WakaTime data error:", error);
			}
		},
	},
};
</script>
