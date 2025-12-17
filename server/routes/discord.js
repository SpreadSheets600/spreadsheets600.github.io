const express = require("express");
const router = express.Router();

const USER_ID = process.env.LANYARD_USER_ID || "727012870683885578";

router.get("/status", async (req, res) => {
	try {
		const response = await fetch(`https://api.lanyard.rest/v1/users/${USER_ID}`);
		const data = await response.json();

		if (!data.success) {
			return res.status(404).json({ error: "User not found" });
		}

		res.json(data.data);
	} catch (error) {
		console.error("Discord Status Error:", error);
		res.status(500).json({ error: "Failed to fetch Discord status" });
	}
});

module.exports = router;
