<template>
	<header class="relative py-12 sm:py-16 lg:py-20">
		<div class="grid items-center gap-8 lg:gap-10 lg:grid-cols-2 justify-center">
			<div class="justify-center text-center lg:text-left order-2 lg:order-1">
				<h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
					<span class="bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent"> 「 SOHAM MAITY 」 </span>
				</h1>
				<p class="mt-4 max-w-xl text-white/80 mx-auto lg:mx-0 text-sm sm:text-base">Computer Science Major • Tech Enthusiast • Anime Lover</p>
				<div class="mt-6 flex flex-wrap gap-3 justify-center lg:justify-start">
					<a href="#projects" class="btn-primary">
						View Projects
						<ph-arrow-right :size="16" class="opacity-80" />
					</a>
					<a href="#contact" class="btn-secondary">Contact</a>
					<router-link to="/terminal" class="btn-terminal">
						<ph-terminal :size="16" />
						SSH To My Server
					</router-link>
				</div>
			</div>
			<div class="flex justify-center lg:justify-end order-1 lg:order-2">
				<div class="relative">
					<div class="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-white/20 via-white/10 to-transparent blur-xl"></div>
					<img src="https://avatars.githubusercontent.com/u/115402296?v=4" alt="Soham profile picture" class="relative w-48 h-48 sm:w-64 sm:h-64 lg:w-72 lg:h-72 xl:w-80 xl:h-80 rounded-2xl object-cover ring-1 ring-white/20 shadow-glow" />
				</div>
			</div>
		</div>
	</header>
</template>

<script>
import { PhArrowRight, PhTerminal } from "@phosphor-icons/vue";

export default {
	name: "Hero",
	components: {
		PhArrowRight,
		PhTerminal,
	},
};
</script>

<style scoped>
.btn-primary {
	@apply inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white/90 hover:bg-white/15 transition;
}

.btn-secondary {
	@apply inline-flex items-center gap-2 rounded-xl border border-white/15 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white/90 hover:bg-white/10 transition;
}

.btn-terminal {
	@apply inline-flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-green-400 hover:bg-green-500/20 transition;
}
</style>
