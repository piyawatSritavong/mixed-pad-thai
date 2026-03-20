import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#9E080F",
          dark: "#7A060B",
          light: "#C4090F",
        },
        accent: {
          DEFAULT: "#F7B90B",
          dark: "#D49A08",
          light: "#FAD04D",
        },
      },
      boxShadow: {
        card: "0 2px 16px rgba(0,0,0,0.08)",
        "card-hover": "0 8px 24px rgba(0,0,0,0.14)",
      },
    },
  },
  plugins: [],
};

export default config;
