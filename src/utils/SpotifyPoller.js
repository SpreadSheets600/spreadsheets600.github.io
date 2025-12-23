export class SpotifyPoller {
	constructor(apiService, callback) {
		this.api = apiService;
		this.callback = callback;
		this.interval = null;
		this.isPlaying = false;
		this.retryCount = 0;
	}

	start() {
		this.poll();
	}

	stop() {
		if (this.interval) clearTimeout(this.interval);
	}

	async poll() {
		try {
			const data = await this.api.getSpotifyStatus();
			this.callback(data);

			let nextPoll = 30000;
			if (data.is_playing) nextPoll = 2000;
			if (data.error) nextPoll = 300000;

			this.retryCount = 0;
			this.interval = setTimeout(() => this.poll(), nextPoll);
		} catch (error) {
			this.retryCount++;
			const backoff = Math.min(60000, 5000 * this.retryCount);
			this.interval = setTimeout(() => this.poll(), backoff);
		}
	}
}
