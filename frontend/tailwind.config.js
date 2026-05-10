/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
        body: ["'DM Sans'", "sans-serif"],
      },
      colors: {
        void: "#060608",
        surface: "#0d0d12",
        panel: "#13131a",
        border: "#1e1e2e",
        accent: "#7c3aed",
        "accent-glow": "#9f5fff",
        neon: "#00f5c4",
        "neon-dim": "#00c49a",
        danger: "#ff3b5c",
        gold: "#ffd166",
        silver: "#a8b2c1",
        bronze: "#cd7f32",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        "slide-up": "slideUp 0.4s ease-out",
        "fade-in": "fadeIn 0.3s ease-out",
        "scan": "scan 3s linear infinite",
      },
      keyframes: {
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(124, 58, 237, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(124, 58, 237, 0.6)" },
        },
        slideUp: {
          from: { opacity: 0, transform: "translateY(20px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
      },
      boxShadow: {
        neon: "0 0 30px rgba(0, 245, 196, 0.3)",
        "neon-sm": "0 0 15px rgba(0, 245, 196, 0.2)",
        accent: "0 0 30px rgba(124, 58, 237, 0.4)",
        "accent-sm": "0 0 15px rgba(124, 58, 237, 0.2)",
      },
    },
  },
  plugins: [],
};
