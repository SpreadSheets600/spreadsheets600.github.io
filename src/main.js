import { createRouter, createWebHistory } from "vue-router";
import PhosphorIcons from "@phosphor-icons/vue";
import { createApp } from "vue";
import App from "./App.vue";
import "./style.css";

import Projects from "./views/Projects.vue";
import Terminal from "./views/Terminal.vue";
import Links from "./views/Links.vue";
import Tools from "./views/Tools.vue";
import Home from "./views/Home.vue";

const routes = [
	{ path: "/projects", name: "Projects", component: Projects, meta: { title: "Projects" } },
	{ path: "/terminal", name: "Terminal", component: Terminal, meta: { title: "Terminal" } },
	{ path: "/connect", name: "Connect", component: Links, meta: { title: "Connect" } },
	{ path: "/tools", name: "Tools", component: Tools, meta: { title: "Tools" } },
	{ path: "/", name: "Home", component: Home, meta: { title: "Home" } },
	{ path: "/links", redirect: "/connect" },
];

const router = createRouter({
	history: createWebHistory(),
	routes,
	scrollBehavior(to, from, savedPosition) {
		if (to.hash) {
			return { el: to.hash, behavior: "smooth" };
		}
		return savedPosition || { top: 0 };
	},
});

router.beforeEach((to, from, next) => {
	const baseTitle = "Soham's Portfolio";
	document.title = to.meta.title ? `${to.meta.title} | ${baseTitle}` : baseTitle;
	next();
});

createApp(App).use(router).use(PhosphorIcons).mount("#app");
