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
        danger: {
          DEFAULT: "#EF4444",
          soft: "#FEE2E2",
          rose: "#E11D48",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 23, 41, 0.04), 0 0 0 1px rgba(15, 23, 41, 0.04)",
        cardLg:
          "0 12px 32px -12px rgba(10, 31, 68, 0.18), 0 4px 8px -4px rgba(10, 31, 68, 0.06)",
        glow: "0 0 0 4px rgba(82, 225, 231, 0.18)",
        primary:
          "0 1px 0 rgba(255, 255, 255, 0.15) inset, 0 4px 12px -4px rgba(10, 31, 68, 0.4)",
        cyan: "0 1px 0 rgba(255, 255, 255, 0.4) inset, 0 4px 12px -4px rgba(82, 225, 231, 0.5)",
        "glow-cyan-lg": "0 0 32px rgba(82, 225, 231, 0.35)",
        "glow-purple": "0 0 32px rgba(185, 100, 255, 0.25)",
      },
      backgroundImage: {
        "navy-gradient": "linear-gradient(180deg, #0A1F44 0%, #06122A 100%)",
        "cyan-gradient": "linear-gradient(180deg, #52E1E7 0%, #3BC8CF 100%)",
        "grad-progress": "linear-gradient(90deg, #52E1E7 0%, #5D57EB 100%)",
        "grad-ambient-light":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(82, 225, 231, 0.08), transparent), radial-gradient(ellipse 60% 40% at 100% 0%, rgba(185, 100, 255, 0.05), transparent), #F7F9FC",
        "grad-ambient-dark":
          "radial-gradient(ellipse 60% 40% at 20% 0%, rgba(82, 225, 231, 0.18), transparent 60%), radial-gradient(ellipse 50% 35% at 100% 100%, rgba(93, 87, 235, 0.20), transparent 60%), linear-gradient(180deg, #0A1F44 0%, #06122A 100%)",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.2, 0.7, 0.2, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
