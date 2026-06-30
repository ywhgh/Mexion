import type { Config } from "tailwindcss";

const zeroScale = {
  none: "0",
  sm: "0",
  DEFAULT: "0",
  md: "0",
  lg: "0",
  xl: "0",
  "2xl": "0",
  "3xl": "0",
  full: "0",
};

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    colors: {
      paper: "#FAF8F5",
      vellum: "#FDFDF9",
      ink: "#111111",
      mute: "#737373",
      rule: "#171717",
      cinnabar: "#C93B2B",
      white: "#FFFFFF",
      transparent: "transparent",
      current: "currentColor",
    },
    extend: {
      fontFamily: {
        serif: ["Noto Serif SC", "serif"],
        mono: ["JetBrains Mono", "monospace"],
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "system-ui", "sans-serif"],
      },
    },
    borderRadius: zeroScale,
    boxShadow: {},
  },
  plugins: [],
} satisfies Config;
