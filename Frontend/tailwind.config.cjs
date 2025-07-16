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
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
