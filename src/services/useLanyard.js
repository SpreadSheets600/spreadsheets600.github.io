import { ref, onMounted, onUnmounted } from "vue";
import axios from "axios";

const USER_ID = import.meta.env.VITE_LANYARD_USER_ID || "727012870683885578";

export function useLanyard() {
	const presence = ref(null);
	const userInfo = ref(null);
	const loading = ref(true);
	const error = ref(false);
	const wsConnected = ref(false);
	let ws = null;
	let heartbeatInterval = null;

	const fetchUserData = async () => {
		try {
			const response = await axios.get("/api/discord/status");
			userInfo.value = response.data;
			presence.value = response.data; // for initial data before ws connects
			loading.value = false;
			error.value = false;
		} catch (err) {
			console.error("Failed to fetch Discord user data:", err);
			error.value = true;
			loading.value = false;
		}
	};

	const connectWebSocket = () => {
		try {
			ws = new WebSocket("wss://api.lanyard.rest/socket");

			ws.onopen = () => {
				console.log("Connected to Lanyard WebSocket");
			};

			ws.onmessage = (event) => {
				const data = JSON.parse(event.data);

				switch (data.op) {
					case 1: // Hello
						if (heartbeatInterval) clearInterval(heartbeatInterval);
						heartbeatInterval = setInterval(() => {
							if (ws.readyState === WebSocket.OPEN) {
								ws.send(JSON.stringify({ op: 3 }));
							}
						}, data.d.heartbeat_interval);

						ws.send(
							JSON.stringify({
								op: 2,
								d: { subscribe_to_id: USER_ID },
							})
						);
						break;

					case 0: // Event
						if (data.t === "INIT_STATE") {
							presence.value = data.d;
							wsConnected.value = true;
						} else if (data.t === "PRESENCE_UPDATE") {
							presence.value = data.d;
						}
						// merge initial user data with presence data
						if (userInfo.value) {
							presence.value = { ...userInfo.value, ...presence.value };
						}
						break;
				}
			};

			ws.onclose = () => {
				console.log("Lanyard WebSocket closed.");
				wsConnected.value = false;
				if (heartbeatInterval) {
					clearInterval(heartbeatInterval);
				}
				// Optional: try to reconnect
			};

			ws.onerror = (err) => {
				console.error("Lanyard WebSocket error:", err);
				wsConnected.value = false;
			};
		} catch (err) {
			console.error("WebSocket connection failed:", err);
		}
	};

	onMounted(async () => {
		await fetchUserData();
		if (!error.value) {
			connectWebSocket();
		}
	});

	onUnmounted(() => {
		if (ws) {
			ws.close();
		}
		if (heartbeatInterval) {
			clearInterval(heartbeatInterval);
		}
	});

	return { presence, userInfo, loading, error, wsConnected, fetchUserData };
}
