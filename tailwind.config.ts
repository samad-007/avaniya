import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        foreground: "#FFFFFF",
        card: {
          DEFAULT: "#0a0a0a",
          elevated: "#111111",
          foreground: "#FFFFFF",
        },
        border: {
          DEFAULT: "#222222",
          focus: "#444444",
        },
        muted: {
          DEFAULT: "#141414",
          foreground: "#888888",
        },
        accent: {
          green: "#22C55E",
          red: "#EF4444",
          amber: "#F59E0B",
          blue: "#3B82F6",
        },
      },
      fontFamily: {
        sans: ["var(--font-plex-sans)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
