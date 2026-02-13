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
        black: "#0A0A0A",
        charcoal: "#1A1A2E",
        navy: "#16213E",
        steel: "#0F3460",
        accent: "#E94560",
        gold: "#C9A227",
        smoke: "#2C2C3E",
        fog: "#3D3D56",
        light: "#E8E8E8",
        muted: "#9A9AB0",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "monospace"],
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
