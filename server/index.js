import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { spotifyRouter } from "./routes/spotify.js";
import { anilistRouter } from "./routes/anilist.js";
import { steamRouter } from "./routes/steam.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/spotify", spotifyRouter);
app.use("/api/anilist", anilistRouter);
app.use("/api/steam", steamRouter);

// Discord route (REST API fallback)
app.get("/api/discord/status", async (req, res) => {
	try {
		const USER_ID = process.env.LANYARD_USER_ID || "727012870683885578";
		const response = await fetch(`https://api.lanyard.rest/v1/users/${USER_ID}`);
		const data = await response.json();

		if (!data.success) {
			return res.status(404).json({ error: "User not found" });
		}

		// Fetch primary guild data if available
		let enrichedData = data.data;
		if (data.data.kv && data.data.kv.primary_guild) {
			try {
				const guildData = JSON.parse(data.data.kv.primary_guild);
				enrichedData.primary_guild = guildData;
			} catch (e) {
				console.warn('Failed to parse primary_guild data:', e);
			}
		}

		res.json(enrichedData);
	} catch (error) {
		console.error("Discord status error:", error);
		res.status(500).json({ error: "Failed to fetch Discord status" });
	}
});

app.get("/api/health", (req, res) => {
	res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
