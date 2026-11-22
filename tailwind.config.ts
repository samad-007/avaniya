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
          primary: "rgb(var(--md-sys-color-primary-rgb) / <alpha-value>)",
          "on-primary": "rgb(var(--md-sys-color-on-primary-rgb) / <alpha-value>)",
          "primary-container":
            "rgb(var(--md-sys-color-primary-container-rgb) / <alpha-value>)",
          "on-primary-container":
            "rgb(var(--md-sys-color-on-primary-container-rgb) / <alpha-value>)",
          secondary: "rgb(var(--md-sys-color-secondary-rgb) / <alpha-value>)",
          "on-secondary":
            "rgb(var(--md-sys-color-on-secondary-rgb) / <alpha-value>)",
          "secondary-container":
            "rgb(var(--md-sys-color-secondary-container-rgb) / <alpha-value>)",
          "on-secondary-container":
            "rgb(var(--md-sys-color-on-secondary-container-rgb) / <alpha-value>)",
          tertiary: "rgb(var(--md-sys-color-tertiary-rgb) / <alpha-value>)",
          "on-tertiary":
            "rgb(var(--md-sys-color-on-tertiary-rgb) / <alpha-value>)",
          "tertiary-container":
            "rgb(var(--md-sys-color-tertiary-container-rgb) / <alpha-value>)",
          "on-tertiary-container":
            "rgb(var(--md-sys-color-on-tertiary-container-rgb) / <alpha-value>)",
          surface: "rgb(var(--md-sys-color-surface-rgb) / <alpha-value>)",
          "surface-lowest":
            "rgb(var(--md-sys-color-surface-container-lowest-rgb) / <alpha-value>)",
          "surface-low":
            "rgb(var(--md-sys-color-surface-container-low-rgb) / <alpha-value>)",
          "surface-container":
            "rgb(var(--md-sys-color-surface-container-rgb) / <alpha-value>)",
          "surface-high":
            "rgb(var(--md-sys-color-surface-container-high-rgb) / <alpha-value>)",
          "surface-highest":
            "rgb(var(--md-sys-color-surface-container-highest-rgb) / <alpha-value>)",
          "on-surface":
            "rgb(var(--md-sys-color-on-surface-rgb) / <alpha-value>)",
          "on-surface-variant":
            "rgb(var(--md-sys-color-on-surface-variant-rgb) / <alpha-value>)",
          outline: "rgb(var(--md-sys-color-outline-rgb) / <alpha-value>)",
          "outline-variant":
            "rgb(var(--md-sys-color-outline-variant-rgb) / <alpha-value>)",
          error: "rgb(var(--md-sys-color-error-rgb) / <alpha-value>)",
          "on-error": "rgb(var(--md-sys-color-on-error-rgb) / <alpha-value>)",
          "error-container":
            "rgb(var(--md-sys-color-error-container-rgb) / <alpha-value>)",
          "on-error-container":
            "rgb(var(--md-sys-color-on-error-container-rgb) / <alpha-value>)",
          positive: "rgb(var(--md-sys-color-positive-rgb) / <alpha-value>)",
          "positive-container":
            "rgb(var(--md-sys-color-positive-container-rgb) / <alpha-value>)",
          "on-positive-container":
            "rgb(var(--md-sys-color-on-positive-container-rgb) / <alpha-value>)",
          warning: "rgb(var(--md-sys-color-warning-rgb) / <alpha-value>)",
          "warning-container":
            "rgb(var(--md-sys-color-warning-container-rgb) / <alpha-value>)",
          "on-warning-container":
            "rgb(var(--md-sys-color-on-warning-container-rgb) / <alpha-value>)",
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
