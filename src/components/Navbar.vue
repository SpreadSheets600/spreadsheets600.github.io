<template>
	<nav class="sticky top-0 z-50 border-b border-white/10 bg-black/30 backdrop-blur-xl">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex h-16 items-center justify-between">
				<router-link to="/" class="text-lg font-semibold tracking-wide">
					<span class="bg-gradient-to-r from-white via-white/80 to-white/60 bg-clip-text text-transparent"> SpreadSheets600 </span>
				</router-link>

				<ul class="hidden gap-8 md:flex">
					<li><router-link to="/" class="nav-link" :class="{ active: $route.name === 'Home' }">Home</router-link></li>
					<li><router-link to="/projects" class="nav-link" :class="{ active: $route.name === 'Projects' }">Projects</router-link></li>
					<li><router-link to="/connect" class="nav-link" :class="{ active: $route.name === 'Connect' }">Connect</router-link></li>
					<li><router-link to="/tools" class="nav-link" :class="{ active: $route.name === 'Tools' }">Tools</router-link></li>
					<li>
						<router-link to="/terminal" class="nav-link terminal-link inline-flex items-center" :class="{ active: $route.name === 'Terminal' }">
							<ph-terminal :size="16" class="mr-1" />
							<span>Terminal</span>
						</router-link>
					</li>
				</ul>

				<button @click="toggleMobileMenu" class="md:hidden inline-flex items-center justify-center rounded-md p-2 text-white/70 hover:text-white hover:bg-white/10 transition" aria-label="Toggle Menu">
					<ph-list :size="20" v-if="!showMobileMenu" />
					<ph-x :size="20" v-else />
				</button>
			</div>
		</div>

		<div v-show="showMobileMenu" class="border-t border-white/10 bg-black/40 backdrop-blur-xl md:hidden">
			<div class="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
				<ul class="grid gap-2">
					<li><router-link to="/" class="mobile-nav-link" :class="{ active: $route.name === 'Home' }" @click="closeMobileMenu">Home</router-link></li>
					<li><router-link to="/projects" class="mobile-nav-link" :class="{ active: $route.name === 'Projects' }" @click="closeMobileMenu">Projects</router-link></li>
					<li><router-link to="/connect" class="mobile-nav-link" :class="{ active: $route.name === 'Connect' }" @click="closeMobileMenu">Connect</router-link></li>
					<li><router-link to="/tools" class="mobile-nav-link" :class="{ active: $route.name === 'Tools' }" @click="closeMobileMenu">Tools</router-link></li>
					<li>
						<router-link to="/terminal" class="mobile-nav-link inline-flex items-center !text-green-400" :class="{ active: $route.name === 'Terminal' }" @click="closeMobileMenu">
							<span>Terminal</span>
						</router-link>
					</li>
				</ul>
			</div>
		</div>
	</nav>
</template>

<script>
import { PhTerminal, PhList, PhX } from "@phosphor-icons/vue";

export default {
	name: "Navbar",
	components: {
		PhTerminal,
		PhList,
		PhX,
	},
	data() {
		return {
			showMobileMenu: false,
		};
	},
	methods: {
		toggleMobileMenu() {
			this.showMobileMenu = !this.showMobileMenu;
		},
		closeMobileMenu() {
			this.showMobileMenu = false;
		},
	},
	watch: {
		$route() {
			this.closeMobileMenu();
		},
	},
};
</script>

<style scoped>
.nav-link {
	@apply text-sm font-semibold text-white/70 hover:text-white transition-all duration-200 relative;
}

.nav-link.active {
	@apply text-white;
}

.nav-link.active::after {
	content: "";
	@apply absolute -bottom-4 left-0 right-0 h-0.5 bg-gradient-to-r from-white/60 to-white/30 rounded-full;
}

.terminal-link {
	@apply bg-gradient-to-r from-green-500/20 to-green-400/20 px-3 py-1.5 rounded-lg border border-green-400/30 hover:border-green-400/50;
}

.mobile-nav-link {
	@apply block rounded-md px-3 py-2 text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200;
}

.mobile-nav-link.active {
	@apply text-white bg-white/10;
}
</style>
