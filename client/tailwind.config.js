/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}", // 🧩 bao luôn TSX nếu có
  ],
  theme: {
    extend: {
      colors: {
        glassWhite: "rgba(255, 255, 255, 0.25)",
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        fall: "fall 10s linear infinite",
        "bounce-slow": "bounce-slow 3s ease-in-out infinite",
      },
      keyframes: {
        fall: {
          "0%": { transform: "translateY(-10vh) rotate(0deg)" },
          "100%": { transform: "translateY(110vh) rotate(360deg)" },
        },
        "bounce-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(10px)" },
        },
      },
    },
  },
  plugins: [],
};
