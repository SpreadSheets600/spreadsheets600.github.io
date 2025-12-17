<template>
	<div class="text-white font-sans min-h-screen">
		<div class="h-[calc(100vh-64px)] sm:h-[calc(100vh-80px)] p-2 sm:p-4 lg:p-8">
			<div ref="terminalContainer" class="h-full rounded-xl sm:rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl overflow-hidden">
				<!-- Terminal Header -->
				<div class="border-b border-white/10 bg-black/20 p-3 sm:p-4">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2 sm:gap-4">
							<div class="flex gap-1 sm:gap-2">
								<div class="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
								<div class="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
								<div class="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
							</div>
							<span class="font-mono text-green-400 text-xs sm:text-sm">soham@archlinux:~</span>
						</div>
						<div class="flex items-center gap-2 sm:gap-4">
							<span class="text-xs sm:text-sm text-white/60 hidden sm:block">Arch Terminal</span>
							<router-link to="/" class="text-white/70 hover:text-white transition">
								<ph-house :size="16" class="sm:w-5 sm:h-5" />
							</router-link>
						</div>
					</div>
				</div>

				<!-- Terminal Content -->
				<div class="p-3 sm:p-6 font-mono text-xs sm:text-sm overflow-auto h-[calc(100%-60px)] sm:h-[calc(100%-80px)]" @click="$refs.commandInput?.focus()">
					<div class="mb-4">
						<div class="text-green-400">Welcome to soham's Arch Terminal</div>
						<div class="text-white/60 text-xs">Type 'help' to see available commands</div>
					</div>

					<div ref="output" class="mb-4"></div>

					<div class="flex items-center flex-wrap sm:flex-nowrap">
						<span class="text-green-400">soham@archlinux</span>
						<span class="text-white">:</span>
						<span class="text-blue-400">{{ currentDirDisplay }}</span>
						<span class="text-white ml-1">$ </span>
						<div class="flex-1 ml-2 relative min-w-0">
							<input 
								ref="commandInput" 
								v-model="currentCommand" 
								@keydown="handleKeydown" 
								type="text" 
								class="bg-transparent border-none outline-none text-green-400 w-full font-mono text-xs sm:text-sm" 
								autocomplete="off" 
								autofocus 
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { terminalCommands } from "../utils/terminalCommands.js";
import { PhHouse } from "@phosphor-icons/vue";

export default {
	name: "Terminal",
	components: {
		PhHouse,
	},
	data() {
		return {
			currentCommand: "",
			commandHistory: [],
			historyIndex: -1,
			currentDir: "/home/soham",
			startTime: Date.now(),
		};
	},
	computed: {
		currentDirDisplay() {
			return this.currentDir === "/home/soham" ? "~" : this.currentDir;
		},
		cursorPosition() {
			return this.currentCommand.length;
		},
	},
	mounted() {
		this.addOutput("", terminalCommands.neofetch([], { startTime: this.startTime }));
		// Focus input when component mounts
		this.$nextTick(() => {
			if (this.$refs.commandInput) {
				this.$refs.commandInput.focus();
			}
		});
	},
	methods: {
		async handleKeydown(e) {
			if (e.key === "Enter") {
				const command = this.currentCommand.trim();
				if (command === "clear") {
					this.$refs.output.innerHTML = "";
					this.currentCommand = "";
					return;
				}
				
				const result = await this.executeCommand(command);
				this.addOutput(command, result);
				this.currentCommand = "";
			} else if (e.key === "ArrowUp") {
				e.preventDefault();
				if (this.historyIndex > 0) {
					this.historyIndex--;
					this.currentCommand = this.commandHistory[this.historyIndex];
				}
			} else if (e.key === "ArrowDown") {
				e.preventDefault();
				if (this.historyIndex < this.commandHistory.length - 1) {
					this.historyIndex++;
					this.currentCommand = this.commandHistory[this.historyIndex];
				} else {
					this.historyIndex = this.commandHistory.length;
					this.currentCommand = "";
				}
			} else if (e.key === "Tab") {
				e.preventDefault();
				const matches = Object.keys(terminalCommands).filter((cmd) => cmd.startsWith(this.currentCommand));
				if (matches.length === 1) {
					this.currentCommand = matches[0];
				}
			}
		},
		async executeCommand(cmd) {
			const trimmed = cmd.trim();
			if (!trimmed) return "";

			this.commandHistory.push(trimmed);
			this.historyIndex = this.commandHistory.length;

			const [command, ...args] = trimmed.split(" ");

			if (terminalCommands[command]) {
				const result = terminalCommands[command](args, {
					currentDir: this.currentDir,
					startTime: this.startTime,
					setCurrentDir: (dir) => {
						this.currentDir = dir;
					},
					commandHistory: this.commandHistory,
					outputRef: this.$refs.output,
				});
				return result instanceof Promise ? await result : result;
			} else {
				return `bash: ${command}: command not found`;
			}
		},
		addOutput(command, result) {
			const div = document.createElement("div");
			div.innerHTML = `
        <div class="flex items-center mb-1">
          <span class="text-green-400">soham@archlinux</span>
          <span class="text-white">:</span>
          <span class="text-blue-400">${this.currentDirDisplay}</span>
          <span class="text-white ml-1">$ </span>
          <span class="text-green-400 ml-1">${command}</span>
        </div>
        ${result ? `<div class="mb-2 whitespace-pre-wrap text-white/80">${result}</div>` : ""}
      `;
			this.$refs.output.appendChild(div);

			this.$nextTick(() => {
				const terminal = this.$refs.terminalContainer;
				if (terminal) {
					terminal.scrollTop = terminal.scrollHeight;
				}
			});
		},
	},
};
</script>