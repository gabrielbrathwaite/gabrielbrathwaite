import type { Config } from "tailwindcss";

/**
 * DESIGN SYSTEM — tokens, not raw colors.
 *
 * Every color is a semantic CSS variable defined in app/globals.css (once for
 * light, once for dark). Components use names like `bg-surface` or `text-muted`
 * and never hardcode hex — so dark mode and any future re-theme is a one-file
 * change. The `rgb(var(--x) / <alpha-value>)` pattern keeps Tailwind's opacity
 * modifiers working (e.g. `bg-accent/10`).
 */
const withAlpha = (v: string) => `rgb(var(${v}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class", // next-themes toggles the `.dark` class on <html>
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.mdx",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: withAlpha("--bg"), // page background
        surface: withAlpha("--surface"), // cards / raised panels
        "surface-2": withAlpha("--surface-2"), // nested / hover
        border: withAlpha("--border"), // hairlines
        ink: withAlpha("--ink"), // primary text
        muted: withAlpha("--muted"), // secondary text
        faint: withAlpha("--faint"), // tertiary / captions
        accent: withAlpha("--accent"), // the one real accent
        "accent-ink": withAlpha("--accent-ink"), // text ON the accent
      },
      fontFamily: {
        // Wired up via next/font in app/layout.tsx.
        serif: ["var(--font-display)", "Georgia", "serif"], // editorial display
        sans: ["var(--font-sans)", "system-ui", "sans-serif"], // body / UI
        mono: ["var(--font-mono)", "ui-monospace", "monospace"], // code / labels
      },
      maxWidth: {
        // One shared content measure so every page lines up.
        content: "72rem",
        prose: "42rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.21,0.5,0.32,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
