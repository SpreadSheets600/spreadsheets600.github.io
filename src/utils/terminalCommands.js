const fileSystem = {
	"/": {
		type: "dir",
		contents: ["home", "usr", "var", "etc", "bin", "tmp", "root"],
	},
	"/home": {
		type: "dir",
		contents: ["soham"],
	},
	"/home/soham": {
		type: "dir",
		contents: [".bashrc", ".profile", ".viminfo", ".ssh", "projects", "documents", "downloads"],
	},
	"/home/soham/projects": {
		type: "dir",
		contents: ["steam-wrapped", "novatra", "porahobebot", "discord-bots", "web-apps"],
	},
	"/home/soham/.bashrc": {
		type: "file",
		content: `# ~/.bashrc: executed by bash(1) for non-login shells.

export PATH=$HOME/bin:/usr/local/bin:$PATH
export EDITOR=vim

# Aliases
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'
alias ..='cd ..'
alias ...='cd ../..'

# Custom prompt
PS1='\\[\\033[01;32m\\]\\u@\\h\\[\\033[00m\\]:\\[\\033[01;34m\\]\\w\\[\\033[00m\\]\\$ '`,
	},
};

export const terminalCommands = {
	help: () => `<span style="color: #00ff88; font-weight: bold;">Available Commands:</span>

<span style="color: #ffaa00;">System Info:</span>
  <span style="color: #00ff88;">neofetch</span>     - Display system information with ASCII art
  <span style="color: #00ff88;">whoami</span>       - Show current user
  <span style="color: #00ff88;">uptime</span>       - System uptime
  <span style="color: #00ff88;">date</span>         - Current date and time
  <span style="color: #00ff88;">uname</span>        - System information

<span style="color: #ffaa00;">File Operations:</span>
  <span style="color: #00ff88;">ls</span> [path]    - List directory contents
  <span style="color: #00ff88;">cd</span> [path]    - Change directory
  <span style="color: #00ff88;">pwd</span>          - Print working directory
  <span style="color: #00ff88;">cat</span> [file]   - Display file contents

<span style="color: #ffaa00;">Fun Stuff:</span>
  <span style="color: #00ff88;">cowsay</span> [text] - ASCII cow says something
  <span style="color: #00ff88;">fortune</span>       - Random programming wisdom
  <span style="color: #00ff88;">spotify</span>       - Current Spotify track and playlists
  <span style="color: #00ff88;">steam</span>         - Steam profile and gaming info

<span style="color: #ffaa00;">Utilities:</span>
  <span style="color: #00ff88;">echo</span> [text]   - Display text
  <span style="color: #00ff88;">history</span>       - Command history
  <span style="color: #00ff88;">clear</span>         - Clear terminal
  <span style="color: #00ff88;">exit</span>          - Return to portfolio

<span style="color: #666;">Tip: Use Tab for command completion, ↑/↓ for history</span>`,

	echo: (args) => (args.length ? args.join(" ") : ""),

	whoami: () => `<span style="color: #00ff88;">soham</span>`,

	pwd: (args, ctx) => `<span style="color: #88aaff;">${ctx.currentDir}</span>`,

	ls: (args, ctx) => {
		const path = args[0] || ctx.currentDir;
		const fullPath = path.startsWith("/") ? path : `${ctx.currentDir}/${path}`;
		const dir = fileSystem[fullPath];

		if (!dir) return `<span style="color: #ff6b6b;">ls: cannot access '${path}': No such file or directory</span>`;
		if (dir.type !== "dir") return `<span style="color: #ff6b6b;">ls: ${path}: Not a directory</span>`;

		return dir.contents
			.map((item) => {
				const itemPath = `${fullPath}/${item}`;
				const itemObj = fileSystem[itemPath];
				if (itemObj && itemObj.type === "dir") {
					return `<span style="color: #88aaff;">${item}/</span>`;
				}
				return `<span style="color: #ffffff;">${item}</span>`;
			})
			.join("  ");
	},

	cd: (args, ctx) => {
		if (!args[0]) {
			ctx.setCurrentDir("/home/soham");
			return "";
		}

		const path = args[0];
		let newPath;

		if (path === "..") {
			const parts = ctx.currentDir.split("/").filter((p) => p);
			parts.pop();
			newPath = "/" + parts.join("/");
			if (newPath === "/") newPath = "/";
		} else if (path.startsWith("/")) {
			newPath = path;
		} else {
			newPath = ctx.currentDir === "/" ? `/${path}` : `${ctx.currentDir}/${path}`;
		}

		if (fileSystem[newPath] && fileSystem[newPath].type === "dir") {
			ctx.setCurrentDir(newPath);
			return "";
		} else {
			return `<span style="color: #ff6b6b;">cd: ${path}: No such file or directory</span>`;
		}
	},

	cat: (args, ctx) => {
		if (!args[0]) return `<span style="color: #ff6b6b;">cat: missing file operand</span>`;
		const path = args[0].startsWith("/") ? args[0] : `${ctx.currentDir}/${args[0]}`;
		const file = fileSystem[path];

		if (!file) return `<span style="color: #ff6b6b;">cat: ${args[0]}: No such file or directory</span>`;
		if (file.type === "dir") return `<span style="color: #ff6b6b;">cat: ${args[0]}: Is a directory</span>`;

		return `<span style="color: #cccccc;">${file.content || "File content not available"}</span>`;
	},

	date: () => {
		const now = new Date();
		return `<span style="color: #ffaa00;">${now.toLocaleDateString("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		})}</span>
<span style="color: #88aaff;">${now.toLocaleTimeString()}</span>`;
	},

	uptime: (args, ctx) => {
		const uptimeMs = Date.now() - ctx.startTime;
		const days = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));
		const hours = Math.floor((uptimeMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));

		let result = "<span style='color: #00ff88;'>System uptime: </span>";
		if (days > 0) result += `<span style='color: #ffaa00;'>${days}d </span>`;
		if (hours > 0) result += `<span style='color: #ffaa00;'>${hours}h </span>`;
		result += `<span style='color: #ffaa00;'>${minutes}m</span>`;

		return result;
	},

	uname: (args) => {
		if (args.includes("-a")) {
			return `<span style="color: #88aaff;">Linux archlinux 6.6.8-arch1-1 #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux</span>`;
		}
		return `<span style="color: #88aaff;">Linux</span>`;
	},

	neofetch: (args, ctx) => {
		const uptimeMs = Date.now() - ctx.startTime;
		const days = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));
		const hours = Math.floor((uptimeMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));

		const uptime = days > 0 ? `${days}d ${hours}h ${minutes}m` : hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

		const memUsed = Math.floor(Math.random() * 8 + 4);
		const memTotal = 16;
		const diskUsed = Math.floor(Math.random() * 200 + 100);
		const diskTotal = 512;

		return `<span style="color: #88aaff;">   ⡏⠉⠉⠉⠉⠉⠉⠋⠉⠉⠉⠉⠉⠉⠋⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠙⠉⠉⠉⠹</span>     <span style="color: #00ff88; font-weight: bold;">soham@archlinux</span>
<span style="color: #88aaff;">   ⡇⢸⣿⡟⠛⢿⣷⠀⢸⣿⡟⠛⢿⣷⡄⢸⣿⡇⠀⢸⣿⡇⢸⣿⡇⠀⢸⣿⡇⠀</span>     <span style="color: #666;">────────────────────</span>
<span style="color: #88aaff;">   ⡇⢸⣿⣧⣤⣾⠿⠀⢸⣿⣇⣀⣸⡿⠃⢸⣿⡇⠀⢸⣿⡇⢸⣿⣇⣀⣸⣿⡇⠀</span>    <span style="color: #ffaa00;">OS:</span> <span style="color: #ffffff;">Arch Linux x86_64</span>
<span style="color: #88aaff;">   ⡇⢸⣿⡏⠉⢹⣿⡆⢸⣿⡟⠛⢻⣷⡄⢸⣿⡇⠀⢸⣿⡇⢸⣿⡏⠉⢹⣿⡇⠀</span>    <span style="color: #ffaa00;">Host:</span> <span style="color: #ffffff;">MSI Thin 15</span>
<span style="color: #88aaff;">   ⡇⢸⣿⣧⣤⣼⡿⠃⢸⣿⡇⠀⢸⣿⡇⠸⣿⣧⣤⣼⡿⠁⢸⣿⡇⠀⢸⣿⡇⠀</span>    <span style="color: #ffaa00;">Kernel:</span> <span style="color: #ffffff;">6.6.8-arch1-1</span>
<span style="color: #88aaff;">   ⣇⣀⣀⣀⣀⣀⣀⣄⣀⣀⣀⣀⣀⣀⣀⣠⣀⡈⠉⣁⣀⣄⣀⣀⣀⣠⣀⣀⣀⣰</span>    <span style="color: #ffaa00;">Uptime:</span> <span style="color: #ffffff;">${new Date().toLocaleTimeString()}</span>
<span style="color: #88aaff;">   ⣇⣿⠘⣿⣿⣿⡿⡿⣟⣟⢟⢟⢝⠵⡝⣿⡿⢂⣼⣿⣷⣌⠩⡫⡻⣝⠹⢿⣿⣷</span>    
<span style="color: #88aaff;">   ⡆⣿⣆⠱⣝⡵⣝⢅⠙⣿⢕⢕⢕⢕⢝⣥⢒⠅⣿⣿⣿⡿⣳⣌⠪⡪⣡⢑⢝⣇</span>    <span style="color: #ffaa00;">Shell:</span> <span style="color: #ffffff;">zsh 5.9</span>
<span style="color: #88aaff;">   ⡆⣿⣿⣦⠹⣳⣳⣕⢅⠈⢗⢕⢕⢕⢕⢕⢈⢆⠟⠋⠉⠁⠉⠉⠁⠈⠼⢐⢕⢽</span>    <span style="color: #ffaa00;">Resolution:</span> <span style="color: #ffffff;">2560x1600</span>
<span style="color: #88aaff;">   ⡗⢰⣶⣶⣦⣝⢝⢕⢕⠅⡆⢕⢕⢕⢕⢕⣴⠏⣠⡶⠛⡉⡉⡛⢶⣦⡀⠐⣕⢕</span>    
<span style="color: #88aaff;">   ⡝⡄⢻⢟⣿⣿⣷⣕⣕⣅⣿⣔⣕⣵⣵⣿⣿⢠⣿⢠⣮⡈⣌⠨⠅⠹⣷⡀⢱⢕</span>    <span style="color: #ffaa00;">Terminal:</span> <span style="color: #ffffff;">Web-Terminal</span>
<span style="color: #88aaff;">   ⡝⡵⠟⠈⢀⣀⣀⡀⠉⢿⣿⣿⣿⣿⣿⣿⣿⣼⣿⢈⡋⠴⢿⡟⣡⡇⣿⡇⡀⢕</span>    <span style="color: #ffaa00;">CPU:</span> <span style="color: #ffffff;">Intel i7-13620H (12) @ 2.40 GHz</span>
<span style="color: #88aaff;">   ⡝⠁⣠⣾⠟⡉⡉⡉⠻⣦⣻⣿⣿⣿⣿⣿⣿⣿⣿⣧⠸⣿⣦⣥⣿⡇⡿⣰⢗⢄</span>    <span style="color: #ffaa00;">GPU:</span> <span style="color: #ffffff;">NVIDIA GeForce RTX 2050 (3.87 GiB)</span>
<span style="color: #88aaff;">   ⠁⢰⣿⡏⣴⣌⠈⣌⠡⠈⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣬⣉⣉⣁⣄⢖⢕⢕⢕</span>    
<span style="color: #88aaff;">   ⡀⢻⣿⡇⢙⠁⠴⢿⡟⣡⡆⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣵⣵⣿</span>    
<span style="color: #88aaff;">   ⡻⣄⣻⣿⣌⠘⢿⣷⣥⣿⠇⣿⣿⣿⣿⣿⣿⠛⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿</span>    <span style="color: #ffaa00;">Memory:</span> <span style="color: #ffffff;">29.80 GiB</span>
<span style="color: #88aaff;">   ⣷⢄⠻⣿⣟⠿⠦⠍⠉⣡⣾⣿⣿⣿⣿⣿⣿⢸⣿⣦⠙⣿⣿⣿⣿⣿⣿⣿⣿⠟</span>    <span style="color: #ffaa00;">Disk:</span> <span style="color: #ffffff;">476.837 GiB </span>
<span style="color: #88aaff;">   ⡕⡑⣑⣈⣻⢗⢟⢞⢝⣻⣿⣿⣿⣿⣿⣿⣿⠸⣿⠿⠃⣿⣿⣿⣿⣿⣿⡿⠁⣠</span>    <span style="color: #ffaa00;">Local IP:</span> <span style="color: #ffffff;">192.168.1.42</span>
<span style="color: #88aaff;">   ⡝⡵⡈⢟⢕⢕⢕⢕⣵⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣶⣿⣿⣿⣿⣿⠿⠋⣀⣈⠙</span>    
<span style="color: #88aaff;">   ⡝⡵⡕⡀⠑⠳⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠛⢉⡠⡲⡫⡪⡪⡣</span>     <span style="color: #00ff88;">●</span><span style="color: #ff6b6b;">●</span><span style="color: #ffaa00;">●</span><span style="color: #88aaff;">●</span><span style="color: #ff88ff;">●</span><span style="color: #66ffff;">●</span><span style="color: #ffffff;">●</span><span style="color: #888888;">●</span>`;
	},

	cowsay: (args) => {
		const text = args.join(" ") || "Hello from the terminal!";
		const border = "_".repeat(text.length + 2);
		return `<span style="color: #ffaa00;"> ${border}
< ${text} >
 ${border.replace(/_/g, "-")}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||</span>`;
	},

	fortune: () => {
		const fortunes = [
			"<span style='color: #88aaff;'>\"The best way to predict the future is to invent it.\"</span> <span style='color: #666;'>- Alan Kay</span>",
			"<span style='color: #88aaff;'>\"Code is like humor. When you have to explain it, it's bad.\"</span> <span style='color: #666;'>- Cory House</span>",
			"<span style='color: #88aaff;'>\"There are only 10 types of people: those who understand binary and those who don't.\"</span>",
			"<span style='color: #88aaff;'>\"Programming is 10% science, 20% ingenuity, and 70% getting the ingenuity to work.\"</span>",
			"<span style='color: #88aaff;'>\"Any fool can write code that a computer can understand. Good programmers write code that humans can understand.\"</span> <span style='color: #666;'>- Martin Fowler</span>",
			"<span style='color: #88aaff;'>\"First, solve the problem. Then, write the code.\"</span> <span style='color: #666;'>- John Johnson</span>",
			"<span style='color: #88aaff;'>\"Experience is the name everyone gives to their mistakes.\"</span> <span style='color: #666;'>- Oscar Wilde</span>",
		];
		return fortunes[Math.floor(Math.random() * fortunes.length)];
	},

	spotify: async () => {
		try {
			const baseUrl = window.location.hostname === "localhost" ? "http://localhost:8888/.netlify/functions" : "/.netlify/functions";

			const [trackResponse, playlistResponse] = await Promise.all([fetch(`${baseUrl}/spotify-current-track`), fetch(`${baseUrl}/spotify-playlists`)]);

			const trackData = await trackResponse.json();
			const playlists = await playlistResponse.json();

			let result = "";

			// Current track info
			if (trackData && trackData.is_playing) {
				result += `<span style='color: #00ff88;'>♪ Now Playing</span>
<span style='color: #ffaa00;'>🎵 Track:</span> <span style='color: #ffffff;'>${trackData.track}</span>
<span style='color: #ffaa00;'>👤 Artist:</span> <span style='color: #88aaff;'>${trackData.artist}</span>
<span style='color: #ffaa00;'>💿 Album:</span> <span style='color: #cccccc;'>${trackData.album}</span>`;

				if (trackData.progress_ms && trackData.duration_ms) {
					const progress = Math.floor(trackData.progress_ms / 1000);
					const total = Math.floor(trackData.duration_ms / 1000);
					const progressPercent = Math.floor((trackData.progress_ms / trackData.duration_ms) * 20);
					const progressBar = "█".repeat(progressPercent) + "░".repeat(20 - progressPercent);
					result += `\n<span style='color: #666;'>[${progressBar}] ${Math.floor(progress / 60)}:${(progress % 60).toString().padStart(2, "0")} / ${Math.floor(total / 60)}:${(total % 60).toString().padStart(2, "0")}</span>`;
				}
			} else {
				result += "<span style='color: #666;'>♪ Not currently playing anything</span>";
			}

			// Playlists
			if (playlists && playlists.length > 0) {
				result += "\n\n<span style='color: #ffaa00;'>🎵 My Playlists:</span>";
				playlists.slice(0, 6).forEach((playlist, i) => {
					result += `\n  <span style='color: #88aaff;'>${i + 1}.</span> <span style='color: #ffffff;'>${playlist.name}</span> <span style='color: #666;'>(${playlist.tracks} tracks)</span>`;
				});
			}

			return result;
		} catch (error) {
			return "<span style='color: #ff6b6b;'>❌ Failed to fetch Spotify data</span>";
		}
	},

	steam: async () => {
		try {
			const baseUrl = window.location.hostname === "localhost" ? "http://localhost:8888/.netlify/functions" : "/.netlify/functions";

			const response = await fetch(`${baseUrl}/steam-summary`);
			const data = await response.json();

			if (!data) {
				return "<span style='color: #ff6b6b;'>❌ Failed to fetch Steam data</span>";
			}

			const statusColors = {
				online: "#00ff88",
				offline: "#666",
				away: "#ffaa00",
				busy: "#ff6b6b",
			};

			const statusColor = statusColors[data.status] || "#666";
			const currentGame = data.currentlyPlaying ? `<span style='color: #00ff88;'>🎮 Currently Playing:</span> <span style='color: #ffffff;'>${data.currentlyPlaying}</span>` : "<span style='color: #666;'>🎮 Not currently playing anything</span>";

			let recentGames = "";
			if (data.recentGames && data.recentGames.length > 0) {
				recentGames =
					"\n<span style='color: #ffaa00;'>📋 Recent Games:</span>\n" +
					data.recentGames
						.slice(0, 3)
						.map((game) => `  <span style='color: #88aaff;'>•</span> <span style='color: #ffffff;'>${game.name}</span> <span style='color: #666;'>(${game.playtime_forever}h)</span>`)
						.join("\n");
			}

			return `<span style='color: #88aaff;'>🎮 Steam Profile</span>
<span style='color: #ffaa00;'>👤 Name:</span> <span style='color: #ffffff;'>${data.name}</span>
<span style='color: #ffaa00;'>🌐 Status:</span> <span style='color: ${statusColor};'>${data.status}</span>
<span style='color: #ffaa00;'>🎯 Total Games:</span> <span style='color: #ffffff;'>${data.totalGames}</span>
<span style='color: #ffaa00;'>⏱️ Total Hours:</span> <span style='color: #ffffff;'>${data.totalHoursPlayed}h</span>
<span style='color: #ffaa00;'>🌍 Country:</span> <span style='color: #ffffff;'>${data.country}</span>

${currentGame}${recentGames}

<span style='color: #666;'>Profile: ${data.profileUrl}</span>`;
		} catch (error) {
			return "<span style='color: #ff6b6b;'>❌ Failed to fetch Steam data</span>";
		}
	},

	history: (args, ctx) => {
		if (ctx.commandHistory.length === 0) {
			return "<span style='color: #666;'>No commands in history</span>";
		}
		return ctx.commandHistory.map((cmd, i) => `<span style='color: #666;'>${(i + 1).toString().padStart(4)}</span> <span style='color: #ffffff;'>${cmd}</span>`).join("\n");
	},

	exit: () => {
		window.location.href = "/";
		return "<span style='color: #00ff88;'>Goodbye! 👋 Redirecting to portfolio...</span>";
	},
};
