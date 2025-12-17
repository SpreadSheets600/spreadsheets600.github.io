<template>
	<main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
		<header class="text-center mb-8 sm:mb-12">
			<h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-white">
				<span class="bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">Projects</span>
			</h1>
			<p class="mt-4 max-w-2xl text-white/80 mx-auto text-sm sm:text-base">Recent repositories and contributions from GitHub</p>
		</header>

		<GitHubProjects />
		<Footer />
	</main>
</template>

<script>
import GitHubProjects from "../components/GitHubProjects.vue";
import Footer from "../components/Footer.vue";

export default {
	name: "ProjectsView",
	components: {
		GitHubProjects,
		Footer,
	},
};
</script>
