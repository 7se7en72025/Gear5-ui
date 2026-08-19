import type { Config } from "tailwindcss";

/**
 * Tokens are declared in app/globals.css as bare oklch channels; wrapping them
 * with `<alpha-value>` here is what lets `border-danger/50` and friends work.
 */
const token = (name: string) => `oklch(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./registry/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: token("bg"),
          subtle: token("bg-subtle"),
        },
        fg: {
          DEFAULT: token("fg"),
          muted: token("fg-muted"),
          faint: token("fg-faint"),
        },
        panel: {
          DEFAULT: token("panel"),
          raised: token("panel-raised"),
        },
        line: {
          DEFAULT: token("line"),
          strong: token("line-strong"),
        },
        accent: {
          DEFAULT: token("accent"),
          fg: token("accent-fg"),
          soft: token("accent-soft"),
        },
        success: token("success"),
        danger: token("danger"),
        warning: token("warning"),
        risk: {
          low: token("risk-low"),
          medium: token("risk-medium"),
          high: token("risk-high"),
        },
        add: {
          DEFAULT: token("add"),
          bg: token("add-bg"),
        },
        del: {
          DEFAULT: token("del"),
          bg: token("del-bg"),
        },
      },
      borderRadius: {
        panel: "var(--radius)",
        chip: "var(--radius-sm)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: [
          "ui-monospace",
          "SF Mono",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
