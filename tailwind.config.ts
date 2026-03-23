import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        lot: {
          primary: "#0182CB",
          accent: "#FF8102",
          error: "#EA4747",
          slate: {
            50: "#F8FAFC",
            100: "#F1F5F9",
            200: "#E2E8F0",
            300: "#CBD5E1",
            400: "#94A3B8",
            500: "#64748B",
            600: "#475569",
            700: "#334155",
            800: "#1F2937",
            900: "#111827",
          },
          success: "#16A34A",
          warn: "#F59E0B",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;

