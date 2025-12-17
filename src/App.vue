<template>
	<div class="app-container">
		<Background />
		<Navbar />
		<router-view />
	</div>
</template>

<script>
import Background from "./components/Background.vue";
import Navbar from "./components/Navbar.vue";

export default {
	name: "App",
	components: {
		Background,
		Navbar,
	},
};
</script>

<style>
@media (max-width: 640px) {
	.app-container {
		font-size: 14px;
	}
}
</style>
