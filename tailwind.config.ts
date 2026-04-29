import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0A1F44",
          deep: "#06122A",
          soft: "#1B2F5C",
        },
        cyan: {
          DEFAULT: "#52E1E7",
          soft: "#A8EFF2",
          deep: "#3BC8CF",
        },
        purple: { DEFAULT: "#B964FF", soft: "#E0BCFF" },
        blue: { DEFAULT: "#5D57EB" },
        ink: {
          DEFAULT: "#0F1729",
          soft: "#475569",
          mute: "#94A3B8",
        },
        success: { DEFAULT: "#10B981", soft: "#D1FAE5" },
        warning: { DEFAULT: "#F59E0B", soft: "#FEF3C7" },
        danger: { DEFAULT: "#EF4444", soft: "#FEE2E2" },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 23, 41, 0.04), 0 0 0 1px rgba(15, 23, 41, 0.04)",
        cardLg: "0 12px 32px -12px rgba(10, 31, 68, 0.18), 0 4px 8px -4px rgba(10, 31, 68, 0.06)",
        glow: "0 0 0 4px rgba(82, 225, 231, 0.18)",
      },
      backgroundImage: {
        "navy-gradient": "linear-gradient(180deg, #0A1F44 0%, #06122A 100%)",
        "cyan-gradient": "linear-gradient(180deg, #52E1E7 0%, #3BC8CF 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
