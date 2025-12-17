<template>
	<div class="mb-8 sm:mb-12">
		<h2 class="text-xl sm:text-2xl font-bold text-white/90 mb-4 sm:mb-6 flex items-center gap-2">
			<ph-link :size="24" class="text-blue-400" />
			Social Links
		</h2>
		<div class="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<a
				v-for="link in socialLinks"
				:key="link.title"
				:href="link.url"
				target="_blank"
				class="flex items-center gap-3 sm:gap-4 rounded-xl border border-white/20 bg-white/5 p-3 sm:p-4 transition hover:bg-white/10 hover:border-white/30"
			>
				<div class="flex size-8 sm:size-10 items-center justify-center rounded-lg bg-white/10 flex-shrink-0">
					<component :is="link.icon" :size="16" :class="link.color" />
				</div>
				<div class="min-w-0 flex-1">
					<h3 class="font-semibold text-white text-sm sm:text-base truncate">{{ link.title }}</h3>
					<p class="text-xs sm:text-sm text-white/60 truncate">{{ link.description }}</p>
				</div>
			</a>
		</div>
	</div>
</template>

<script>
import { markRaw } from "vue";
import { PhLink, PhGithubLogo, PhLinkedinLogo, PhInstagramLogo, PhArticle, PhStackOverflowLogo, PhNotebook } from "@phosphor-icons/vue";

export default {
	name: "SocialLinks",
	components: {
		PhLink,
	},
	data() {
		return {
			socialLinks: [
				{
					title: "GitHub",
					description: "Code Repositories",
					url: "https://github.com/SpreadSheets600",
					icon: markRaw(PhGithubLogo),
					color: "text-white",
				},
				{
					title: "LinkedIn",
					description: "Professional Network",
					url: "https://linkedin.com/in/soham-maity",
					icon: markRaw(PhLinkedinLogo),
					color: "text-blue-400",
				},
				{
					title: "Instagram",
					description: "Personal Life",
					url: "https://instagram.com/spreadheets600",
					icon: markRaw(PhInstagramLogo),
					color: "text-pink-400",
				},
				{
					title: "Blog",
					description: "Tech & Life",
					url: "https://blog.spreadsheets.dev",
					icon: markRaw(PhArticle),
					color: "text-green-400",
				},
				{
					title: "Stack Overflow",
					description: "Q&A and Reputation",
					url: "https://stackoverflow.com/users/13963841/spreadsheets",
					icon: markRaw(PhStackOverflowLogo),
					color: "text-orange-400",
				},
				{
					title: "Notes",
					description: "Public Notes & Resources",
					url: "https://notes.spreadsheets.dev",
					icon: markRaw(PhNotebook),
					color: "text-purple-400",
				},
			],
		};
	},
};
</script>
