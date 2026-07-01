import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./public/**/*.html"],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    colors: {
      bg: "var(--bg)", "bg-2": "var(--bg-2)",
      surface: "var(--surface)", "surface-2": "var(--surface-2)", warm: "var(--warm)",
      border: "var(--border)", "border-2": "var(--border-2)", hairline: "var(--hairline)",
      ink: "var(--ink)", "ink-2": "var(--ink-2)",
      muted: "var(--muted)", "mute-2": "var(--mute-2)", "mute-3": "var(--mute-3)",
      "on-ink": "var(--on-ink)",
      verm: "var(--verm)", "verm-2": "var(--verm-2)",
      "verm-soft": "var(--verm-soft)", "verm-tint": "var(--verm-tint)",
      green: "var(--green)", "green-2": "var(--green-2)", "green-soft": "var(--green-soft)",
      blue: "var(--blue)", "blue-soft": "var(--blue-soft)",
      amber: "var(--amber)", "amber-2": "var(--amber-2)", "amber-soft": "var(--amber-soft)",
      plum: "var(--plum)", "plum-soft": "var(--plum-soft)",
      teal: "var(--teal)", "teal-soft": "var(--teal-soft)",
      rose: "var(--rose)", "rose-soft": "var(--rose-soft)",
      transparent: "transparent", current: "currentColor",
      white: "#FFFFFF", black: "#000000",
    },
    fontFamily: {
      sans: "var(--f-sans)".split(","),
      cn: "var(--f-cn)".split(","),
      mono: "var(--f-mono)".split(","),
      display: "var(--f-display)".split(","),
      serif: "var(--f-serif)".split(","),
    },
    borderRadius: {
      none: "0", DEFAULT: "0",
      xs: "4px", sm: "6px", md: "8px", lg: "10px", xl: "14px", full: "9999px",
    },
    boxShadow: {
      none: "none",
      s1: "0 1px 2px rgba(20,18,14,0.03), 0 0 0 1px var(--border)",
      s2: "0 6px 22px -10px rgba(20,18,14,0.10), 0 1px 2px rgba(20,18,14,0.04)",
    },
    extend: {},
  },
  plugins: [],
} satisfies Config;
