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
	help: () => `Available commands:
  File Operations:
    ls [path]     - List directory contents
    cd [path]     - Change directory
    pwd           - Print working directory
    cat [file]    - Display file contents
    
  System Info:
    whoami        - Current user
    uname [-a]    - System information
    neofetch      - System info with ASCII
    uptime        - System uptime
    date          - Current date/time
    
  Fun Commands:
    cowsay [text] - ASCII cow says something
    fortune       - Random fortune cookie
    spotify       - Show current Spotify track
    music         - Alias for spotify
    
  System Control:
    history       - Command history
    clear         - Clear terminal
    exit          - Return to portfolio`,

	whoami: () => "soham",

	pwd: (args, ctx) => ctx.currentDir,

	ls: (args, ctx) => {
		const path = args[0] || ctx.currentDir;
		const fullPath = path.startsWith("/") ? path : `${ctx.currentDir}/${path}`;
		const dir = fileSystem[fullPath];

		if (!dir) return `ls: cannot access '${path}': No such file or directory`;
		if (dir.type !== "dir") return `ls: ${path}: Not a directory`;

		return dir.contents.join("  ");
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
			return `cd: ${path}: No such file or directory`;
		}
	},

	cat: (args, ctx) => {
		if (!args[0]) return "cat: missing file operand";
		const path = args[0].startsWith("/") ? args[0] : `${ctx.currentDir}/${args[0]}`;
		const file = fileSystem[path];

		if (!file) return `cat: ${args[0]}: No such file or directory`;
		if (file.type === "dir") return `cat: ${args[0]}: Is a directory`;

		return file.content || "File content not available";
	},

	echo: (args) => args.join(" "),

	date: () => new Date().toString(),

	uptime: (args, ctx) => {
		const uptimeMs = Date.now() - ctx.startTime;
		const days = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));
		const hours = Math.floor((uptimeMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((uptimeMs % (1000 * 60)) / 1000);
		return `up ${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;
	},

	uname: (args) => {
		if (args.includes("-a")) {
			return "Linux vps 5.15.0-91-generic #101-Ubuntu SMP Tue Nov 14 13:30:08 UTC 2023 x86_64 x86_64 x86_64 GNU/Linux";
		}
		return "Linux";
	},

	neofetch: (args, ctx) => {
		const uptimeMs = Date.now() - ctx.startTime;
		const days = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));
		const hours = Math.floor((uptimeMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((uptimeMs % (1000 * 60)) / 1000);
		return `
                    /\\                          soham@archlinux
                   /  \\                         --------------
                  /\\   \\                        OS: Arch Linux x86_64
                 /      \\                       Kernel: 6.6.8-arch1-1
                /   ,,   \\                      Uptime: ${days}d ${hours}h ${minutes}m ${seconds}s
               /   |  |  -\\                     Shell: zsh 5.9
              /_-''    ''-_\\                    CPU: Intel i7-13620H @ 4.90GHz
                                                GPU: NVIDIA GeForce RTX 4070
                                                Memory: 12.3GiB / 32.0GiB
                                                Local IP: 192.168.1.42
                                                
                                                ${new Date().toLocaleDateString("en-US", {
													weekday: "long",
													year: "numeric",
													month: "long",
													day: "numeric",
												})}
                                                ${new Date().toLocaleTimeString("en-US", {
													hour12: false,
												})}`;
	},

	cowsay: (args) => {
		const text = args.join(" ") || "Hello from Arch!";
		return ` ${"_".repeat(text.length + 2)}
< ${text} >
 ${"‾".repeat(text.length + 2)}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`;
	},

	fortune: () => {
		const fortunes = ["The best way to predict the future is to invent it.", "Code is like humor. When you have to explain it, it's bad.", "There are only 10 types of people: those who understand binary and those who don't.", "A computer is like air conditioning - it becomes useless when you open Windows.", "Programming is 10% science, 20% ingenuity, and 70% getting the ingenuity to work with the science."];
		return fortunes[Math.floor(Math.random() * fortunes.length)];
	},

	spotify: async () => {
		try {
			const response = await fetch("/api/spotify/current-track");
			const data = await response.json();

			if (!data || (!data.is_playing && !data.recently_played)) {
				return "No Spotify activity found";
			}

			const progressBar = data.duration_ms > 0 ? `[${"█".repeat(Math.floor((data.progress_ms / data.duration_ms) * 20))}${" ".repeat(20 - Math.floor((data.progress_ms / data.duration_ms) * 20))}]` : "";

			const currentTime = Math.floor(data.progress_ms / 1000);
			const totalTime = Math.floor(data.duration_ms / 1000);
			const timeDisplay = `${Math.floor(currentTime / 60)}:${(currentTime % 60).toString().padStart(2, "0")} / ${Math.floor(totalTime / 60)}:${(totalTime % 60).toString().padStart(2, "0")}`;

			return `🎵 ${data.is_playing ? "Now Playing" : data.recently_played ? "Recently Played" : "Paused"}
Track: ${data.track}
Artist: ${data.artist}
Album: ${data.album}
${data.duration_ms > 0 ? `${progressBar} ${timeDisplay}` : ""}`;
		} catch (error) {
			return "Failed to fetch Spotify data. Make sure the API is configured.";
		}
	},

	music: async (args, ctx) => terminalCommands.spotify(args, ctx),

	history: (args, ctx) => ctx.commandHistory.map((cmd, i) => `${i + 1}  ${cmd}`).join("\n"),

	exit: () => {
		window.location.href = "/";
		return "Redirecting to home...";
	},
};
