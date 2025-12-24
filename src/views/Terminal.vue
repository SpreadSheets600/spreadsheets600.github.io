<template>
	<div class="terminal-page">
		<div class="terminal-container">
			<div class="terminal-header">
				<div class="header-left">
					<span class="terminal-icon">$</span>
					<span class="terminal-title">Terminal</span>
				</div>
				<router-link to="/" class="back-btn">
					<ph-house :size="20" />
				</router-link>
			</div>
			
			<div class="terminal-content" @click="focusInput">
				<div class="output-section">
					<div v-for="(line, index) in visibleLines" :key="index" v-html="line" class="line"></div>
					
					<div class="current-line">
						<span class="prompt">{{ prompt }}</span>
						<span class="input-display">{{ currentCommand }}</span>
						<span class="cursor">|</span>
						<input 
							ref="commandInput" 
							v-model="currentCommand" 
							@keydown="handleKeydown" 
							class="terminal-input"
							autocomplete="off" 
							autofocus 
						/>
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
			lines: [],
			maxLines: 30,
		};
	},
	computed: {
		currentDirDisplay() {
			return this.currentDir === "/home/soham" ? "~" : this.currentDir;
		},
		prompt() {
			return `soham@archlinux:${this.currentDirDisplay}$ `;
		},
		visibleLines() {
			return this.lines.slice(-this.maxLines);
		},
	},
	mounted() {
		this.showWelcome();
		this.focusInput();
	},
	methods: {
		focusInput() {
			this.$nextTick(() => {
				this.$refs.commandInput?.focus();
			});
		},
		showWelcome() {
			const welcome = terminalCommands.neofetch([], { startTime: this.startTime });
			this.lines.push('<div class="welcome">Welcome to Soham\'s Terminal</div>');
			this.lines.push('<div class="help-text">Type "help" for available commands</div>');
			this.lines.push('');
			welcome.split('\n').forEach(line => {
				this.lines.push(`<div class="output-line">${line}</div>`);
			});
		},
		async handleKeydown(e) {
			if (e.key === "Enter") {
				const command = this.currentCommand.trim();
				
				if (command === "clear") {
					this.lines = [];
					this.currentCommand = "";
					return;
				}

				this.addCommandLine(command);
				
				if (command) {
					const result = await this.executeCommand(command);
					if (result) {
						this.addOutput(result);
					}
				}
				
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
			} else if (e.key === "l" && e.ctrlKey) {
				e.preventDefault();
				this.lines = [];
			}
		},
		addCommandLine(command) {
			this.lines.push(`<div class="command-line">${this.prompt}${command}</div>`);
		},
		addOutput(output) {
			output.split('\n').forEach(line => {
				this.lines.push(`<div class="output-line">${line}</div>`);
			});
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
				});
				return result instanceof Promise ? await result : result;
			} else {
				return `bash: ${command}: command not found`;
			}
		},
	},
};
</script>

<style scoped>
.terminal-page {
	height: 100vh;
	background: #0a0a0a81;
	color: #ffffff;
	font-family: 'JetBrains Mono', 'Fira Code', monospace;
	overflow: hidden;
	padding: 25px;
	box-sizing: border-box;
}

.terminal-container {
	height: 100%;
	display: flex;
	flex-direction: column;
	background: rgba(15, 15, 15, 0.3);
	backdrop-filter: blur(15px);
	border: 1px solid rgba(255, 255, 255, 0.15);
	border-radius: 12px;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.terminal-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 1rem 2rem;
	background: rgba(255, 255, 255, 0.02);
	border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.header-left {
	display: flex;
	align-items: center;
	gap: 0.75rem;
}

.terminal-icon {
	color: #00ff88;
	font-size: 1.5rem;
	font-weight: bold;
}

.terminal-title {
	color: #ffffff;
	font-size: 1.1rem;
	font-weight: 500;
}

.back-btn {
	color: #888888;
	transition: color 0.2s ease;
	padding: 0.5rem;
	border-radius: 6px;
}

.back-btn:hover {
	color: #00ff88;
	background: rgba(0, 255, 136, 0.1);
}

.terminal-content {
	flex: 1;
	padding: 2rem;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.output-section {
	flex: 1;
	overflow: hidden;
}

.line {
	color: #cccccc;
	font-size: 0.95rem;
	line-height: 1.5;
	margin-bottom: 0.2rem;
	white-space: pre-wrap;
}

.current-line {
	display: flex;
	align-items: center;
	margin-top: 0.5rem;
	position: relative;
}

.prompt {
	color: #00ff88;
	font-weight: 600;
	margin-right: 0.5rem;
	white-space: nowrap;
}

.input-display {
	color: #ffffff;
	font-size: 0.95rem;
	font-family: inherit;
}

.terminal-input {
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	background: transparent;
	border: none;
	outline: none;
	color: transparent;
	font-family: inherit;
	font-size: 0.95rem;
	caret-color: transparent;
}

.cursor {
	color: #00ff88;
	animation: blink 1s infinite;
	font-weight: normal;
}

@keyframes blink {
	0%, 50% { opacity: 1; }
	51%, 100% { opacity: 0; }
}

/* Command styling */
:deep(.welcome) {
	color: #00ff88;
	font-weight: 600;
}

:deep(.help-text) {
	color: #888888;
}

:deep(.command-line) {
	color: #00ff88;
}

:deep(.output-line) {
	color: #cccccc;
}

@media (max-width: 768px) {
	.terminal-header {
		padding: 1rem;
	}
	
	.terminal-content {
		padding: 1rem;
	}
	
	.terminal-title {
		font-size: 1rem;
	}
}
</style>
