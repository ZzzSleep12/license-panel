/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0b0f14",
        panel: "#11161c",
        card: "#131a22",
        border: "#1f2a36",
        muted: "#9fb0c3",
        accent: "#1f6feb",
        accent2: "#00c2ff"
      },
      boxShadow: { soft: "0 6px 30px rgba(0,0,0,.25)" }
    },
  },
  plugins: [],
};
