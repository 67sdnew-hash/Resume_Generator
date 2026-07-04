/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        surface: "hsl(var(--surface))",
        card: "hsl(var(--card))",
        cardBorder: "hsl(var(--card-border))",
        text: "hsl(var(--text))",
        muted: "hsl(var(--muted))",
        border: "hsl(var(--border))",
        
        primary: "hsl(var(--primary))",
        secondary: "hsl(var(--secondary))",
        accent: "hsl(var(--accent))",
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        error: "hsl(var(--error))",

        // Backward compatibility for existing elements
        brand: {
          50: "rgba(20, 184, 166, 0.05)",
          100: "rgba(20, 184, 166, 0.15)",
          200: "rgba(20, 184, 166, 0.3)",
          500: "hsl(var(--primary))",
          600: "#0d9488", // Teal 600
          700: "#0f766e", // Teal 700
        },
      },
      borderRadius: {
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
