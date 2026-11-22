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
        md: {
          primary: "var(--md-sys-color-primary)",
          "on-primary": "var(--md-sys-color-on-primary)",
          "primary-container": "var(--md-sys-color-primary-container)",
          "on-primary-container": "var(--md-sys-color-on-primary-container)",
          secondary: "var(--md-sys-color-secondary)",
          "on-secondary": "var(--md-sys-color-on-secondary)",
          "secondary-container": "var(--md-sys-color-secondary-container)",
          "on-secondary-container":
            "var(--md-sys-color-on-secondary-container)",
          tertiary: "var(--md-sys-color-tertiary)",
          "on-tertiary": "var(--md-sys-color-on-tertiary)",
          "tertiary-container": "var(--md-sys-color-tertiary-container)",
          "on-tertiary-container": "var(--md-sys-color-on-tertiary-container)",
          surface: "var(--md-sys-color-surface)",
          "surface-lowest": "var(--md-sys-color-surface-container-lowest)",
          "surface-low": "var(--md-sys-color-surface-container-low)",
          "surface-container": "var(--md-sys-color-surface-container)",
          "surface-high": "var(--md-sys-color-surface-container-high)",
          "surface-highest": "var(--md-sys-color-surface-container-highest)",
          "on-surface": "var(--md-sys-color-on-surface)",
          "on-surface-variant": "var(--md-sys-color-on-surface-variant)",
          outline: "var(--md-sys-color-outline)",
          "outline-variant": "var(--md-sys-color-outline-variant)",
          error: "var(--md-sys-color-error)",
          "on-error": "var(--md-sys-color-on-error)",
          "error-container": "var(--md-sys-color-error-container)",
          "on-error-container": "var(--md-sys-color-on-error-container)",
          positive: "var(--md-sys-color-positive)",
          "positive-container": "var(--md-sys-color-positive-container)",
          "on-positive-container": "var(--md-sys-color-on-positive-container)",
          warning: "var(--md-sys-color-warning)",
          "warning-container": "var(--md-sys-color-warning-container)",
          "on-warning-container": "var(--md-sys-color-on-warning-container)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", '"Google Sans Flex"', "sans-serif"],
        sans: ["var(--font-sans)", '"Google Sans Flex"', "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", '"Google Sans Flex"', "sans-serif"],
      },
      borderRadius: {
        "m3-sm": "12px",
        "m3-md": "16px",
        "m3-lg": "24px",
        "m3-xl": "28px",
        "m3-2xl": "32px",
      },
      boxShadow: {
        "m3-1": "0 1px 3px 1px rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.08)",
        "m3-2": "0 2px 6px 2px rgba(0, 0, 0, 0.08), 0 1px 2px 0 rgba(0, 0, 0, 0.08)",
        "m3-3": "0 6px 16px 2px rgba(0, 0, 0, 0.12), 0 2px 6px 0 rgba(0, 0, 0, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
