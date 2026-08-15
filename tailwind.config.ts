import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        available: "#16a34a",
        unavailable: "#dc2626",
        needsOrder: "#ea580c",
        ordered: "#2563eb",
        completed: "#0f766e",
      },
    },
  },
  plugins: [],
};
export default config;
