import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        serif: ["'Cormorant Garamond'", "Georgia", "serif"],
        sans:  ["'Jost'", "system-ui", "sans-serif"],
      },
      colors: {
        border:       "hsl(var(--border))",
        input:        "hsl(var(--input))",
        ring:         "hsl(var(--ring))",
        background:   "hsl(var(--background))",
        foreground:   "hsl(var(--foreground))",
        primary:      { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary:    { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive:  { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted:        { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent:       { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        popover:      { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card:         { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        sidebar: {
          DEFAULT:            "hsl(var(--sidebar-background))",
          foreground:         "hsl(var(--sidebar-foreground))",
          primary:            "hsl(var(--sidebar-primary))",
          "primary-foreground":"hsl(var(--sidebar-primary-foreground))",
          accent:             "hsl(var(--sidebar-accent))",
          "accent-foreground":"hsl(var(--sidebar-accent-foreground))",
          border:             "hsl(var(--sidebar-border))",
          ring:               "hsl(var(--sidebar-ring))",
        },
        /* Brand tokens as Tailwind utilities */
        grove:   "#2C3E2D",
        sage:    "#7A9E7E",
        "sage-light": "#B5CEBB",
        warm:    "#C8A96E",
        cream:   "#F7F3EE",
        "cream-dark": "#EDE8E1",
        "text-muted-brand": "#8C8278",
        "text-brand":       "#3D3830",
        charcoal: "#2A2A22",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        card: "0 2px 20px rgba(44,62,45,0.08)",
        nav:  "0 2px 12px rgba(44,62,45,0.07)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up":   { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        fadeIn: { from: { opacity: "0", transform: "translateY(4px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        "fade-in": "fadeIn 0.25s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
