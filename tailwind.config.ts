import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "#10b981",
          foreground: "#ffffff",
        },
        warning: {
          DEFAULT: "#f59e0b",
          foreground: "#ffffff",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      boxShadow: {
        "glow-sm": "0 0 15px hsl(239 84% 67% / 0.15)",
        "glow": "0 0 30px hsl(239 84% 67% / 0.2), 0 0 60px hsl(239 84% 67% / 0.08)",
        "glow-lg": "0 0 50px hsl(239 84% 67% / 0.25), 0 0 100px hsl(239 84% 67% / 0.1)",
        "card": "0 1px 3px rgb(0 0 0 / 0.05), 0 4px 16px rgb(0 0 0 / 0.04)",
        "card-hover": "0 4px 24px rgb(0 0 0 / 0.08), 0 1px 4px rgb(0 0 0 / 0.04)",
        "float": "0 20px 60px -12px rgb(0 0 0 / 0.25)",
      },
      transitionDuration: {
        "250": "250ms",
        "400": "400ms",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          from: { transform: "translateX(-100%)" },
          to:   { transform: "translateX(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.93)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
        "blur-in": {
          from: { opacity: "0", filter: "blur(8px)", transform: "translateY(8px)" },
          to:   { opacity: "1", filter: "blur(0)", transform: "translateY(0)" },
        },
        "ping-slow": {
          "75%, 100%": { transform: "scale(2)", opacity: "0" },
        },
        "gradient-pan": {
          "0%, 100%": { backgroundPosition: "0% center" },
          "50%":       { backgroundPosition: "100% center" },
        },
      },
      animation: {
        "fade-in":     "fade-in 0.35s ease-out",
        "slide-up":    "slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in":    "slide-in 0.3s ease-out",
        "scale-in":    "scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "blur-in":     "blur-in 0.45s ease-out",
        "ping-slow":   "ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite",
        "gradient-pan":"gradient-pan 5s ease infinite",
      },
    },
  },
  plugins: [],
};

export default config;
