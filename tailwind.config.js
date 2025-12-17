/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				sans: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
				mono: ["JetBrains Mono", "ui-monospace", "monospace"],
			},
			boxShadow: {
				glow: "0 10px 40px rgba(0,0,0,0.45)",
				innerGlow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
			},
			keyframes: {
				float: {
					"0%, 100%": { transform: "translateY(0)" },
					"50%": { transform: "translateY(-8px)" },
				},
				tilt: {
					"0%, 100%": { transform: "rotate(-1deg)" },
					"50%": { transform: "rotate(1deg)" },
				},
				glow: {
					"0%, 100%": { filter: "drop-shadow(0 0 0 rgba(255,255,255,0.0))" },
					"50%": { filter: "drop-shadow(0 0 24px rgba(255,255,255,0.15))" },
				},
				aurora: {
					"0%": { backgroundPosition: "0% 50%" },
					"50%": { backgroundPosition: "100% 50%" },
					"100%": { backgroundPosition: "0% 50%" },
				},
				shimmer: {
					"0%": { transform: "translateX(-100%)" },
					"100%": { transform: "translateX(100%)" },
				},
				blink: {
					"0%, 50%": { opacity: "1" },
					"51%, 100%": { opacity: "0" },
				},
			},
			animation: {
				float: "float 6s ease-in-out infinite",
				tilt: "tilt 8s ease-in-out infinite",
				glow: "glow 4s ease-in-out infinite",
				aurora: "aurora 18s ease infinite",
				shimmer: "shimmer 2.4s linear infinite",
				blink: "blink 1s infinite",
			},
		},
	},
	plugins: [],
};
