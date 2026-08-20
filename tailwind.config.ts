import type { Config } from "tailwindcss";

/** Brand tokens sampled from the supplied Divineesoft logo files. */
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#0A4BF1", 600: "#0640D1", 700: "#0733A6", deep: "#0B1B4D" },
      },
      fontFamily: {
        display: ["var(--font-display)", "Space Grotesk", "sans-serif"],
        sans: ["var(--font-body)", "IBM Plex Sans", "sans-serif"],
        mono: ["var(--font-mono)", "IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
