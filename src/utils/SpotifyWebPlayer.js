export class SpotifySDK {
	constructor(callback) {
		this.callback = callback;
		this.player = null;
		this.token = null;
	}

	async init() {
		await this.loadSDK();
		await this.getAccessToken();
		this.createPlayer();
	}

	async getAccessToken() {
		const refreshToken = "AQCioBzlA2O3eNeFp2e413SDb3Jw8ZjD06fQdhpdR3uu8uJx1aNENKkwFbouNyNLzY-eIOrnWjzfhlJf0ze9bv_MiMpfY4sJjwed_-PErZjLJzunIdWcfK4s2WN2sBM8XBI";
		const clientId = "c935b949cfde454d8542a79b6c654b14";
		const clientSecret = "1f78595256fb48c98edfd7884c0e92ad";

		const response = await fetch("https://accounts.spotify.com/api/token", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
			},
			body: `grant_type=refresh_token&refresh_token=${refreshToken}`,
		});

		const data = await response.json();
		this.token = data.access_token;
	}

	loadSDK() {
		return new Promise((resolve) => {
			if (window.Spotify) {
				resolve();
				return;
			}

			window.onSpotifyWebPlaybackSDKReady = resolve;

			const script = document.createElement("script");
			script.src = "https://sdk.scdn.co/spotify-player.js";
			document.head.appendChild(script);
		});
	}

	createPlayer() {
		this.player = new window.Spotify.Player({
			name: "Soham Portfolio",
			getOAuthToken: (cb) => cb(this.token),
			volume: 0.0,
		});

		this.player.addListener("player_state_changed", (state) => {
			if (!state) {
				this.callback({ is_playing: false });
				return;
			}

			const track = state.track_window.current_track;
			this.callback({
				is_playing: !state.paused,
				track: track.name,
				artist: track.artists[0].name,
				album: track.album.name,
				image: track.album.images[0]?.url,
				progress_ms: state.position,
				duration_ms: state.duration,
			});
		});

		this.player.addListener("ready", () => {
			console.log("🎵 Spotify connected");
		});

		this.player.connect();
	}

	disconnect() {
		if (this.player) {
			this.player.disconnect();
		}
	}
}
