<template>
	<div class="space-y-12">
		<div v-if="loading" class="text-center text-white/60">
			<div class="animate-pulse">Loading repositories...</div>
		</div>

		<div v-else-if="error" class="text-center text-red-400">
			<div>Failed to load repositories</div>
		</div>

		<div v-else>
			<!-- Pinned Projects -->
			<div class="mb-8 sm:mb-12">
				<h2 class="text-xl sm:text-2xl font-bold text-white/90 mb-4 sm:mb-6 flex items-center gap-2">
					<ph-push-pin :size="24" class="text-yellow-400" />
					Pinned Projects
				</h2>
				<div class="grid gap-4 sm:gap-6 lg:grid-cols-2">
					<article v-for="project in pinnedProjects" :key="project.name" :class="['group rounded-xl sm:rounded-2xl border p-4 sm:p-6 transition hover:-translate-y-1 hover:bg-black/40 backdrop-blur-xl flex flex-col', project.featured ? 'border-yellow-400/30 bg-gradient-to-br from-yellow-500/10 to-black/30 hover:border-yellow-400/50' : 'border-white/10 bg-black/30 hover:border-white/20']">
						<div class="flex items-start justify-between mb-3">
							<h3 class="text-base sm:text-lg font-semibold text-white flex items-center gap-2 min-w-0 flex-1">
								<span class="truncate">{{ project.name }}</span>
								<span v-if="project.featured" class="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-400/30 flex-shrink-0"> Featured </span>
							</h3>
							<div class="flex items-center gap-1 flex-shrink-0 ml-2">
								<span :class="['px-2 py-1 rounded-full border text-xs', getStatusColor(project.status)]">
									{{ project.status }}
								</span>
							</div>
						</div>

						<div class="flex flex-wrap gap-1 mb-3">
							<span v-for="tech in project.tech" :key="tech" class="px-2 py-1 text-xs bg-white/10 text-white/80 rounded border border-white/20">
								{{ tech }}
							</span>
						</div>

						<p class="text-sm text-white/75 flex-1 mb-4 line-clamp-3">{{ project.description }}</p>

						<div class="flex gap-2">
							<a :href="project.githubUrl" target="_blank" class="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-white/20 transition">
								<ph-github-logo :size="16" />
								<span class="hidden sm:inline">Code</span>
								<span class="sm:hidden">GitHub</span>
							</a>
							<a v-if="project.websiteUrl" :href="project.websiteUrl" target="_blank" class="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-3 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-white/10 transition">
								<ph-globe :size="16" />
								<span>Live</span>
							</a>
						</div>
					</article>
				</div>
			</div>

			<!-- All Repositories -->
			<div>
				<div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-4">
					<h2 class="text-xl sm:text-2xl font-bold text-white/90 flex items-center gap-2">
						<ph-folder :size="24" class="text-blue-400" />
						All Repositories
					</h2>
					<a href="https://github.com/SpreadSheets600?tab=repositories" target="_blank" class="px-4 py-2 rounded-full border border-blue-400/40 bg-blue-600/30 text-sm text-blue-100 hover:bg-blue-600/50 transition self-start sm:self-auto"> View More </a>
				</div>
				<div class="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
					<div v-for="repo in otherRepositories" :key="repo.id" class="group rounded-xl sm:rounded-2xl border border-white/10 bg-black/30 p-4 sm:p-6 backdrop-blur-xl hover:border-white/20 transition-all flex flex-col">
						<div class="flex items-start justify-between mb-4">
							<div class="flex items-center gap-2 min-w-0 flex-1">
								<ph-folder :size="20" class="text-blue-400 flex-shrink-0" />
								<h3 class="font-semibold text-white/90 truncate text-sm sm:text-base">{{ repo.name }}</h3>
							</div>
							<div class="flex items-center gap-1 sm:gap-2 flex-shrink-0 ml-2">
								<span v-if="repo.private" class="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-400/30"> Private </span>
								<span v-if="repo.fork" class="px-2 py-1 text-xs bg-purple-500/20 text-purple-400 rounded-full border border-purple-400/30"> Fork </span>
								<span v-if="repo.language" class="px-2 py-1 text-xs rounded-full border hidden sm:inline" :style="{ backgroundColor: getLanguageColor(repo.language) + '20', color: getLanguageColor(repo.language), borderColor: getLanguageColor(repo.language) + '30' }">
									{{ repo.language }}
								</span>
							</div>
						</div>

						<p class="text-sm text-white/70 mb-4 line-clamp-3 flex-1">
							{{ repo.description || "No description available" }}
						</p>

						<a :href="repo.html_url" target="_blank" class="inline-flex items-center justify-center gap-2 text-xs sm:text-sm bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition px-3 sm:px-4 py-2 rounded-lg border border-blue-400/30 hover:border-blue-400/50 mt-auto">
							<span class="hidden sm:inline">View Repository</span>
							<span class="sm:hidden">View</span>
							<ph-arrow-square-out :size="16" />
						</a>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { PhPushPin, PhGithubLogo, PhGlobe, PhFolder, PhArrowSquareOut } from "@phosphor-icons/vue";

export default {
	name: "GitHubProjects",
	components: {
		PhPushPin,
		PhGithubLogo,
		PhGlobe,
		PhFolder,
		PhArrowSquareOut,
	},
	data() {
		return {
			repositories: [],
			loading: true,
			error: false,
			cacheKey: "github_repositories",
			cacheExpiry: 6 * 60 * 60 * 1000, // 6 hours

			blacklistedRepos: ["spreadsheets600", "Uptime-Monitor", "status-page", "dashboard-designs"],

			pinnedProjects: [
				{
					name: "Novatra",
					websiteUrl: "https://novatra.in",
					githubUrl: "https://github.com/NovatraX",
					description: "Novatra is a 100% free online platform for JEE aspirants that offers topic-wise and year-wise previous exam (PYQ) practice questions in a clean, ad-free interface.",
					tech: ["Django", "HTML", "HTMX", "Tailwind CSS", "PostgreSQL"],
					status: "Live",
					featured: true,
				},
				{
					name: "Exam Countdown",
					websiteUrl: "https://novatra.in/extension",
					githubUrl: "https://github.com/NovatraX/exam-countdown-extension",
					description: "A simple javascript based extension that provides countdown timers for the JEE and NEET exams, allowing users to track the time remaining until each exam. Users can customize their preferences to show or hide countdowns based on their interests.",
					tech: ["JavaScript", "Chrome API", "Firefox API"],
					status: "Published",
					featured: false,
				},
				{
					name: "PhotoSpectroscope",
					websiteUrl: null,
					githubUrl: "https://github.com/SpreadSheets600/PhotoSpectroscope",
					description: "Real-time spectroscope analysis from a webcam feed—calculating reflectance and transmittance with OpenCV and Python. Useful for material analysis and education.",
					tech: ["Python", "OpenCV", "NumPy"],
					status: "Active",
					featured: false,
				},
				{
					name: "Steam Wrapped",
					websiteUrl: "http://dono-01.danbot.host:9174/",
					githubUrl: "https://github.com/SpreadSheets600/Steam-Wrapped",
					description: "Personalized gaming analytics dashboard for Steam users.",
					tech: ["Python", "Flask", "Steam API"],
					status: "Beta",
				},
			],
		};
	},
	computed: {
		otherRepositories() {
			return this.repositories; // Already filtered in fetchRepositories
		},
	},
	async mounted() {
		await this.fetchRepositories();
	},
	methods: {
		requestHeaders() {
			const headers = {
				Accept: "application/vnd.github+json",
				"User-Agent": "spreadsheets600-portfolio",
			};

			const token = import.meta.env.VITE_GITHUB_TOKEN;
			if (token) {
				headers.Authorization = `Bearer ${token}`;
			}

			return headers;
		},
		isValidRepoArray(payload) {
			return Array.isArray(payload) && payload.every((r) => r && typeof r === "object" && r.name);
		},
		async fetchRepositories() {
			try {
				this.loading = true;

				// Check cache first
				const cached = this.getFromCache();
				if (cached) {
					this.repositories = cached;
					this.loading = false;
					return;
				}

				const username = "SpreadSheets600";

				const headers = this.requestHeaders();

				const [userRepos, orgs] = await Promise.all([fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=50`, { headers }).then((r) => r.json()), fetch(`https://api.github.com/users/${username}/orgs`, { headers }).then((r) => r.json())]);

				if (!this.isValidRepoArray(userRepos)) {
					throw new Error(userRepos?.message || "Failed to load user repositories");
				}

				let allRepos = [...userRepos];

				for (const org of Array.isArray(orgs) ? orgs : []) {
					try {
						const orgRepos = await fetch(`https://api.github.com/orgs/${org.login}/repos?sort=updated&per_page=50`, { headers }).then((r) => r.json());
						if (!this.isValidRepoArray(orgRepos)) continue;
						allRepos = [...allRepos, ...orgRepos];
					} catch (error) {
						console.warn(`Failed to fetch repos for org ${org.login}:`, error);
					}
				}

				this.repositories = allRepos
					.filter((repo) => repo?.name && !repo.archived && !repo.private && !repo.fork && repo.language !== "Markdown" && repo.updated_at && !this.blacklistedRepos.includes(repo.name.toLowerCase()))
					.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
					.slice(0, 9);

				// Cache the results
				this.saveToCache(this.repositories);
			} catch (error) {
				console.error("Error fetching repositories:", error);
				this.repositories = [];
				this.error = true;
			} finally {
				this.loading = false;
			}
		},
		getFromCache() {
			try {
				const cached = localStorage.getItem(this.cacheKey);
				if (!cached) return null;

				const { data, timestamp } = JSON.parse(cached);
				const now = Date.now();

				if (now - timestamp > this.cacheExpiry) {
					localStorage.removeItem(this.cacheKey);
					return null;
				}

				return data;
			} catch (error) {
				console.warn("Cache read error:", error);
				return null;
			}
		},
		saveToCache(data) {
			try {
				const cacheData = {
					data,
					timestamp: Date.now(),
				};
				localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
			} catch (error) {
				console.warn("Cache write error:", error);
			}
		},
		getLanguageColor(language) {
			const colors = {
				JavaScript: "#f1e05a",
				TypeScript: "#2b7489",
				Python: "#3572A5",
				Java: "#b07219",
				HTML: "#e34c26",
				CSS: "#563d7c",
				Vue: "#4FC08D",
				React: "#61dafb",
				Go: "#00ADD8",
				Rust: "#dea584",
				PHP: "#4F5D95",
				C: "#555555",
				"C++": "#f34b7d",
				Shell: "#89e051",
			};
			return colors[language] || "#8b949e";
		},
		getStatusColor(status) {
			const colors = {
				Live: "bg-green-500/20 text-green-400 border-green-400/30",
				Published: "bg-blue-500/20 text-blue-400 border-blue-400/30",
				Active: "bg-purple-500/20 text-purple-400 border-purple-400/30",
				Beta: "bg-orange-500/20 text-orange-400 border-orange-400/30",
				Development: "bg-yellow-500/20 text-yellow-400 border-yellow-400/30",
			};
			return colors[status] || "bg-gray-500/20 text-gray-400 border-gray-400/30";
		},
	},
};
</script>

<style scoped>
.line-clamp-3 {
	display: -webkit-box;
	-webkit-box-orient: vertical;
	overflow: hidden;
}
</style>
