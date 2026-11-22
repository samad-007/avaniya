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
        background: "#F8FAFC",
        foreground: "#0F172A",
        card: {
          DEFAULT: "#FFFFFF",
          elevated: "#F8FAFC",
          foreground: "#0F172A",
        },
        border: {
          DEFAULT: "#E2E8F0",
          focus: "#94A3B8",
        },
        muted: {
          DEFAULT: "#F1F5F9",
          foreground: "#64748B",
        },
        brand: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
        },
        accent: {
          green: "#059669",
          red: "#E11D48",
          amber: "#D97706",
          blue: "#2563EB",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      boxShadow: {
        soft: "0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.04)",
        card: "0 2px 8px -2px rgba(15, 23, 42, 0.06), 0 1px 3px -1px rgba(15, 23, 42, 0.04)",
        "card-hover": "0 10px 24px -6px rgba(15, 23, 42, 0.09), 0 4px 8px -4px rgba(15, 23, 42, 0.05)",
        modal: "0 24px 48px -12px rgba(15, 23, 42, 0.22)",
      },
    },
  },
  plugins: [],
};

export default config;
