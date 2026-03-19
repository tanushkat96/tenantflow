/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#928ddd",
        secondary: "#b2aef2",
        accent: "#CAC8F9",
        light: "#f2e3fc",
        gray: {
          100: "#E7E9EF",
          400: "#C3C1C1",
        },
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
      },
    },
  },
  plugins: [],
};
