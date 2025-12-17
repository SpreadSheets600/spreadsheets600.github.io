<template>
	<section id="github" class="scroll-mt-24 mt-8 sm:mt-12">
		<div class="mb-4 sm:mb-6 flex items-center justify-between gap-4">
			<h2 class="text-xl sm:text-2xl font-semibold">GitHub Stats</h2>
		</div>

		<div class="grid gap-4 sm:gap-6">
			<div class="grid gap-4 sm:gap-6 lg:grid-cols-2">
				<div class="rounded-xl sm:rounded-2xl border border-white/10 bg-black/30 p-3 sm:p-4 backdrop-blur-xl">
					<img class="w-full rounded-lg" src="https://github-readme-stats.vercel.app/api?username=spreadsheets600&count_private=true&show_icons=true&include_all_commits=true&line_height=21&hide_border=true&theme=dark&title_color=ffffff&text_color=ffffff&icon_color=ffffff" alt="GitHub stats" loading="lazy" />
				</div>
				<div class="rounded-xl sm:rounded-2xl border border-white/10 bg-black/30 p-3 sm:p-4 backdrop-blur-xl">
					<img class="w-full rounded-lg" src="https://github-readme-streak-stats.herokuapp.com?user=spreadsheets600&theme=dark&card_height=180&hide_border=true&background=151515&stroke=FFFFFF&ring=FFFFFF&fire=FFFFFF&currStreakNum=FFFFFF&sideNums=FFFFFF&currStreakLabel=FFFFFF&sideLabels=FFFFFF&dates=FFFFFF" alt="GitHub streak" loading="lazy" />
				</div>
			</div>

			<div class="rounded-xl sm:rounded-2xl border border-white/10 bg-black/30 p-3 sm:p-4 backdrop-blur-xl">
				<img class="w-full rounded-lg" src="https://github-readme-activity-graph.vercel.app/graph?username=SpreadSheets600&theme=react-dark&hide_border=true&bg_color=151515&color=FFFFFF&line=FFFFFF&point=FFFFFF" alt="GitHub activity graph" loading="lazy" />
			</div>

			<div class="rounded-xl sm:rounded-2xl border border-white/10 bg-black/30 p-3 sm:p-4 backdrop-blur-xl">
				<img class="w-full rounded-lg" src="https://holopin.me/spreadsheets600" alt="Holopin badges" loading="lazy" />
			</div>
		</div>
	</section>
</template>

<script>
export default {
	name: "GitHub",
};
</script>
