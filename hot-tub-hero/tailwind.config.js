/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Hot Tub Hero brand palette — calm spa blues with a warm accent.
        brand: {
          DEFAULT: "#0a7ea4",
          dark: "#075a76",
          light: "#3fb6d8",
        },
        accent: "#ff9f1c",
        good: "#2bb673",
        warn: "#f4a93b",
        bad: "#e2493b",
      },
    },
  },
  plugins: [],
};
