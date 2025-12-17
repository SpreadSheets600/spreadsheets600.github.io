<template>
	<article class="group rounded-xl sm:rounded-2xl border border-white/10 bg-black/30 p-4 sm:p-6 transition hover:-translate-y-1 hover:bg-black/40 hover:border-white/20 backdrop-blur-xl flex flex-col">
		<div class="flex items-center gap-3 mb-4">
			<div :class="`p-2 rounded-lg ${tool.bgColor}`">
				<i :class="`ph ${tool.icon} ${tool.iconColor} text-xl sm:text-2xl`"></i>
			</div>
			<h3 class="text-base sm:text-lg font-semibold truncate">{{ tool.title }}</h3>
		</div>
		<p class="text-xs sm:text-sm text-white/75 mb-4 flex-1">{{ tool.description }}</p>
		<div class="flex gap-2 mt-auto flex-wrap">
			<a v-for="link in tool.links" :key="link.label" :href="link.url" target="_blank" :class="link.primary ? 'btn-tool-primary' : 'btn-tool-secondary'">
				{{ link.label }}
			</a>
		</div>
	</article>
</template>

<script>
export default {
	name: "ToolCard",
	props: {
		tool: Object,
	},
};
</script>

<style scoped>
.btn-tool-primary {
	@apply inline-block rounded-xl bg-white/15 px-3 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-white/20 transition;
}

.btn-tool-secondary {
	@apply rounded-xl border border-white/20 px-3 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-white/10 transition;
}
</style>
