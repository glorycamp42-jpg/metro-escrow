import type { Config } from "tailwindcss";

/**
 * Metro Escrow — Hermès-inspired tone.
 * Colors are CSS-variable based so the entire palette can flip
 * between light and dark by toggling `.dark` on <html>.
 *
 * Vars are defined in src/styles/globals.css.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        hermes: {
          50: "rgb(var(--hermes-50) / <alpha-value>)",
          100: "rgb(var(--hermes-100) / <alpha-value>)",
          200: "rgb(var(--hermes-200) / <alpha-value>)",
          300: "rgb(var(--hermes-300) / <alpha-value>)",
          400: "rgb(var(--hermes-400) / <alpha-value>)",
          500: "rgb(var(--hermes-500) / <alpha-value>)",
          600: "rgb(var(--hermes-600) / <alpha-value>)",
          700: "rgb(var(--hermes-700) / <alpha-value>)",
          800: "rgb(var(--hermes-800) / <alpha-value>)",
          900: "rgb(var(--hermes-900) / <alpha-value>)",
          soft: "rgb(var(--hermes-soft) / <alpha-value>)"
        },
        cream: {
          50: "rgb(var(--cream-50) / <alpha-value>)",
          100: "rgb(var(--cream-100) / <alpha-value>)",
          200: "rgb(var(--cream-200) / <alpha-value>)",
          300: "rgb(var(--cream-300) / <alpha-value>)",
          400: "rgb(var(--cream-400) / <alpha-value>)"
        },
        ink: {
          400: "rgb(var(--ink-400) / <alpha-value>)",
          500: "rgb(var(--ink-500) / <alpha-value>)",
          600: "rgb(var(--ink-600) / <alpha-value>)",
          700: "rgb(var(--ink-700) / <alpha-value>)",
          800: "rgb(var(--ink-800) / <alpha-value>)",
          900: "rgb(var(--ink-900) / <alpha-value>)"
        }
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif"
        ],
        display: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      letterSpacing: {
        tightish: "-0.01em",
        tighter2: "-0.02em"
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "8px",
        md: "10px",
        lg: "12px",
        xl: "16px"
      },
      boxShadow: {
        card: "0 1px 0 rgba(44,24,16,0.04), 0 1px 2px rgba(44,24,16,0.04)",
        focus: "0 0 0 3px rgba(243,112,33,0.25)"
      }
    }
  },
  plugins: []
};

export default config;
