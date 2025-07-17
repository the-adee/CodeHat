/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        nero: "#282828",
        gray7: "#121212",
        "dark-blue": "#2196f3",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"], // ← custom font added here
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
