import axios from "axios";

const API_BASE = import.meta.env.DEV 
	? "http://localhost:8888/.netlify/functions" 
	: "/.netlify/functions";

const api = axios.create({
	baseURL: API_BASE,
	timeout: 10000,
});

export const apiService = {
	async getDiscordStatus() {
		const response = await api.get("/discord-status");
		return response.data;
	},

	async getSpotifyPlaylists() {
		const response = await api.get("/spotify-playlists");
		return response.data;
	},

	async getSteamStatus() {
		const response = await api.get("/steam-summary");
		return response.data;
	},

	async getSpotifyStatus() {
		const response = await api.get("/spotify-current-track");
		return response.data;
	},

	async getSpotifyToken() {
		const response = await api.get("/spotify-token");
		return response.data;
	},

	async getAniListData(username) {
		const response = await api.get(`/anilist-user?username=${username}`);
		return response.data;
	},

	async getGitHubProjects(username) {
		const response = await api.get(`/github-repos?username=${username}`);
		return response.data;
	},
};
