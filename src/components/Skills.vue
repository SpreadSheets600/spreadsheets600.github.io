<template>
	<section id="skills" class="scroll-mt-24 mt-12">
		<div class="mb-6 flex items-center justify-between gap-4">
			<h2 class="text-xl sm:text-2xl font-semibold">Skills</h2>
		</div>

		<div class="grid gap-4 sm:gap-6">
			<div v-for="skill in skills" :key="skill.title" class="rounded-2xl border border-white/10 bg-black/30 p-4 sm:p-6 backdrop-blur-xl">
				<h3 class="font-semibold text-sm sm:text-base">{{ skill.title }}</h3>
				<img class="mt-3 rounded-xl max-w-full h-auto" style="max-height: 48px" :src="skill.image" :alt="skill.alt" />
			</div>
		</div>
	</section>
</template>

<script>
export default {
	name: "Skills",
	data() {
		return {
			skills: [
				{
					title: "Languages",
					image: "https://skillicons.dev/icons?i=python,html,css,javascript,bash,c,java&theme=dark",
					alt: "Language skills: Python, HTML, CSS, JavaScript, Bash, C, Java",
				},
				{
					title: "Technologies",
					image: "https://skillicons.dev/icons?i=django,flask,tensorflow,nodejs,opencv,tailwind,vue&theme=dark",
					alt: "Tech skills: Django, Flask, TensorFlow, Node.js, OpenCV, Tailwind, Vue",
				},
				{
					title: "Design & Creativity",
					image: "https://skillicons.dev/icons?i=illustrator,xd,figma&theme=dark",
					alt: "Design skills: Illustrator, Adobe XD, Figma",
				},
				{
					title: "Database",
					image: "https://skillicons.dev/icons?i=sqlite,mongo,mysql,postgres&theme=dark",
					alt: "Database skills: SQLite, MongoDB, MySQL, PostgreSQL",
				},
				{
					title: "Tools",
					image: "https://skillicons.dev/icons?i=linux,vscode,sublime,replit,notion,github,discord,bots&theme=dark",
					alt: "Tools: Linux, VSCode, Sublime, Replit, Notion, GitHub, Discord, Bots",
				},
			],
		};
	},
};
</script>
