<template>
	<div class="background-container">
		<div class="background-image" :style="{ backgroundImage: `url(${backgroundImage})` }"></div>
		<div class="background-overlay"></div>
	</div>
</template>

<script>
export default {
	name: "Background",
	data() {
		return {
			backgroundImages: ["/1.jpg", "/2.jpg", "/3.jpg", "/4.jpg", "/5.jpg"],
			backgroundImage: "/4.jpg",
		};
	},
	mounted() {
		const randomIndex = Math.floor(Math.random() * this.backgroundImages.length);
		this.backgroundImage = this.backgroundImages[randomIndex];
	},
};
</script>

<style scoped>
.background-container {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: -1;
	pointer-events: none;
}

.background-image {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-size: cover;
	background-position: center;
	background-repeat: no-repeat;
}

.background-overlay {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: radial-gradient(60% 60% at 50% 10%, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.08)), rgba(0, 0, 0, 0.8);
	backdrop-filter: blur(5px);
}
</style>
