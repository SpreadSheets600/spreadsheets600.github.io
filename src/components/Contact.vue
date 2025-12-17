<template>
	<section id="contact" class="scroll-mt-24 mt-8 sm:mt-12">
		<div class="mb-4 sm:mb-6 flex items-center justify-between gap-4">
			<h2 class="text-xl sm:text-2xl font-semibold">Contact Me</h2>
		</div>

		<div class="rounded-xl sm:rounded-2xl border border-white/10 bg-black/30 p-4 sm:p-6 backdrop-blur-xl">
			<form @submit.prevent="submitForm" class="grid gap-4">
				<div class="grid gap-4 sm:grid-cols-2">
					<div>
						<label for="name" class="block text-sm font-medium text-white/80">Name</label>
						<input v-model="form.name" type="text" id="name" autocomplete="name" placeholder="Your Name" class="form-input" />
					</div>
					<div>
						<label for="email" class="block text-sm font-medium text-white/80">Email</label>
						<input v-model="form.email" type="email" id="email" required autocomplete="email" placeholder="yourname@youremail.com" class="form-input" />
					</div>
				</div>

				<div>
					<label for="message" class="block text-sm font-medium text-white/80">Message</label>
					<textarea v-model="form.message" id="message" required rows="4" placeholder="Write Your Message ..." class="form-input"></textarea>
				</div>

				<button type="submit" :disabled="loading" :class="['btn-submit', { 'opacity-60 cursor-not-allowed': loading }]">
					<span>{{ loading ? "Sending ..." : "Send Message" }}</span>
				</button>

				<p v-if="status.message" :class="['text-sm', status.success ? 'text-green-400' : 'text-red-400']">
					{{ status.message }}
				</p>
			</form>
		</div>
	</section>
</template>

<script>
export default {
	name: "Contact",
	data() {
		return {
			form: {
				name: "",
				email: "",
				message: "",
			},
			loading: false,
			status: {
				message: "",
				success: false,
			},
		};
	},
	methods: {
		async submitForm() {
			if (!this.form.message.trim()) {
				this.showStatus("Please Enter A Message.", false);
				return;
			}
			if (!this.form.email.trim()) {
				this.showStatus("Please Enter A Valid Email.", false);
				return;
			}

			this.loading = true;

			const webhookUrl = "https://discord.com/api/webhooks/1403400949078167633/cZXHdZmraxI7sHa5gdIpGL-_8ensis45KtEJy8y8SLIDN2d2WV03jZQY7OnCuiT-5ly1";

			const payload = {
				content: `New Contact From ${this.form.name || "Anonymous"} (${this.form.email})`,
				embeds: [
					{
						title: "Portfolio Contact",
						color: 0xffffff,
						fields: [
							{ name: "Name", value: this.form.name || "Anonymous", inline: true },
							{ name: "Email", value: this.form.email, inline: false },
							{
								name: "Message",
								value: this.form.message.length > 1024 ? this.form.message.slice(0, 1021) + "..." : this.form.message,
							},
						],
						timestamp: new Date().toISOString(),
					},
				],
				allowed_mentions: { parse: [] },
			};

			try {
				const response = await fetch(webhookUrl, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
				});

				if (!response.ok) throw new Error("Request Failed");

				this.form = { name: "", email: "", message: "" };
				this.showStatus("Message Sent Successfully.", true);
			} catch (error) {
				this.showStatus("Failed To Send Message!", false);
			} finally {
				this.loading = false;
			}
		},
		showStatus(message, success) {
			this.status = { message, success };
			setTimeout(() => {
				this.status = { message: "", success: false };
			}, 5000);
		},
	},
};
</script>

<style scoped>
.form-input {
	@apply mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30;
}

.btn-submit {
	@apply inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 transition;
}
</style>
