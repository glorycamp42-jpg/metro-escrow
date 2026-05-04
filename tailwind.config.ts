import type { Config } from "tailwindcss";

/**
 * Metro Escrow — Hermès-inspired tone.
 *  - hermes:  signature orange (#F37021)
 *  - cream:   warm paper bg
 *  - ink:     deep brown for text
 *  - sand:    muted secondary text / borders
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        hermes: {
          50: "#FFF3E8",
          100: "#FFE8D6",
          200: "#FFC79A",
          300: "#FBA365",
          400: "#F58A40",
          500: "#F37021", // signature
          600: "#D45F1B",
          700: "#A8470F",
          800: "#7A330A",
          900: "#4A1F05"
        },
        cream: {
          50: "#FFFCF5",
          100: "#FAF6EE", // canvas
          200: "#F2EBDA",
          300: "#E5DCC9",
          400: "#D2C5A8"
        },
        ink: {
          400: "#8A6F4E",
          500: "#6B5640",
          600: "#4A3826",
          700: "#3B2A1A",
          800: "#2C1810", // body text
          900: "#1A0D08"
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
