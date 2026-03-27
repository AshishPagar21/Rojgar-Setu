/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef7f1",
          100: "#d8ecd9",
          500: "#2f8f46",
          600: "#247039",
          700: "#1d5c30",
        },
        accent: {
          500: "#f0a33a",
          600: "#d28722",
        },
      },
      borderRadius: {
        panel: "1rem",
      },
      boxShadow: {
        panel: "0 8px 30px rgba(17, 36, 24, 0.1)",
      },
    },
  },
  plugins: [],
};
