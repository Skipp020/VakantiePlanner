import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          main: "#195AA6",
          mid: "#0B78BE",
          dark: "#1B4B89",
          bright: "#5BC4E8",
          grey: "#575756",
        },
      },
      fontFamily: {
        sans: [
          '"Century Gothic"',
          "var(--font-poppins)",
          '"Segoe UI"',
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
