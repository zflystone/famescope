import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "var(--color-brand)",
          strong: "var(--color-brand-strong)",
          weak: "var(--color-brand-weak)",
          "weak-strong": "var(--color-brand-weak-strong)",
          on: "var(--color-on-brand)",
        },
        page: "var(--color-bg-page)",
        surface: {
          DEFAULT: "var(--color-bg-surface)",
          2: "var(--color-bg-surface-2)",
          elevated: "var(--color-bg-elevated)",
          hover: "var(--color-bg-hover)",
        },
        content: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          tertiary: "var(--color-text-tertiary)",
          inverse: "var(--color-text-inverse)",
        },
        line: {
          DEFAULT: "var(--color-border)",
          strong: "var(--color-border-strong)",
          divider: "var(--color-divider)",
        },
        warning: {
          bg: "var(--color-background-warning)",
          fg: "var(--color-text-warning)",
        },
        info: {
          bg: "var(--color-background-info)",
          fg: "var(--color-text-info)",
        },
        success: {
          bg: "var(--color-background-success)",
          fg: "var(--color-text-success)",
        },
        unread: "var(--color-unread)",
      },
      borderRadius: {
        sm: "var(--border-radius-sm)",
        md: "var(--border-radius-md)",
        lg: "var(--border-radius-lg)",
        xl: "var(--border-radius-xl)",
        pill: "var(--border-radius-pill)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        elevated: "var(--shadow-elevated)",
        nav: "var(--shadow-nav)",
      },
      maxWidth: {
        app: "var(--app-max-width)",
      },
      spacing: {
        page: "16px", // 页面水平边距
        card: "14px", // 卡片内边距
        cardgap: "10px", // 卡片间距
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
        serif: ["var(--font-noto-serif)", "Georgia", "serif"],
      },
      fontSize: {
        // 字体层级（来自设计规范）
        brand: ["19px", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
        name: ["15px", { lineHeight: "1.3" }],
        body: ["15px", { lineHeight: "1.65" }],
        "news-title": ["17px", { lineHeight: "1.4" }],
        quote: ["17px", { lineHeight: "1.55" }],
        meta: ["13px", { lineHeight: "1.4" }],
        tiny: ["12px", { lineHeight: "1.4" }],
      },
    },
  },
  plugins: [],
};
export default config;
