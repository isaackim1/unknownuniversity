import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "unknown-black": "#0a0a0a",
        "unknown-yellow": "#F5C518",
        "unknown-white": "#FAFAFA",
        "unknown-gray": "#1a1a1a",
      },
    },
  },
  plugins: [],
};
export default config;
