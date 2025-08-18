/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // Damit Tailwind alle Klassen in deinem Code scannt
  ],
  theme: {
    extend: {},
  },
  darkMode: "class", // Für deinen ThemeToggle
  plugins: [],
};
