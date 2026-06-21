/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#eef5ff",
          100: "#d9e9ff",
          150: "#c4dcff",
          200: "#a8caff",
          300: "#75abff",
          400: "#4589f5",
          500: "#1d6fe9",
          600: "#1559bf",
          700: "#12499d",
          800: "#0f3a7d",
          900: "#0b2d61",
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
