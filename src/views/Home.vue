<template>
	<main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<Hero />
		<About />
		<Skills />

		<div class="text-center my-16">
			<router-link to="/projects" class="inline-flex items-center gap-2 px-6 sm:px-8 py-3 rounded-full bg-white/10 backdrop-blur border border-white/20 shadow-lg shadow-black/20 transition duration-200 hover:-translate-y-0.5 hover:bg-white/15 hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm sm:text-base">
				<ph-folder :size="20" />
				<span class="font-semibold">View All Projects</span>
				<ph-arrow-right :size="16" />
			</router-link>
		</div>

		<WakaTime />
		<GitHub />

		<Contact />
		<Footer />
	</main>
</template>

<script>
import Hero from "../components/Hero.vue";
import About from "../components/About.vue";
import Skills from "../components/Skills.vue";
import WakaTime from "../components/WakaTime.vue";
import GitHub from "../components/GitHub.vue";
import Contact from "../components/Contact.vue";
import Footer from "../components/Footer.vue";
import { PhFolder, PhArrowRight } from "@phosphor-icons/vue";

export default {
	name: "Home",
	components: {
		Hero,
		About,
		Skills,
		WakaTime,
		GitHub,
		Contact,
		Footer,
		PhFolder,
		PhArrowRight,
	},
};
</script>
