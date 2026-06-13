import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: {
          950: "#030305",
          900: "#07070f",
          800: "#0e0e1f",
          700: "#151528",
          600: "#1c1c35",
        },
        blood: {
          900: "#3d0000",
          800: "#5c0000",
          700: "#7a0000",
          600: "#990000",
          500: "#b91c1c",
          400: "#dc2626",
          300: "#ef4444",
        },
        brass: {
          900: "#3d2e00",
          800: "#6b4f00",
          700: "#957000",
          600: "#b58900",
          500: "#d4a017",
          400: "#e8c547",
          300: "#f5d76e",
        },
        bone: {
          900: "#4a4035",
          800: "#6b5c4a",
          700: "#8c7a62",
          600: "#a89880",
          500: "#c4b49c",
          400: "#ddd0bc",
          300: "#f0e8d8",
          200: "#f8f3ec",
          100: "#fdfaf6",
        },
      },
      fontFamily: {
        display: ["var(--font-cinzel)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "noise": "url('/noise.svg')",
      },
      animation: {
        "flicker": "flicker 3s linear infinite",
        "float": "float 6s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
      },
      keyframes: {
        flicker: {
          "0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100%": { opacity: "1" },
          "20%, 21.999%, 63%, 63.999%, 65%, 69.999%": { opacity: "0.4" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 10px rgba(185, 28, 28, 0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(185, 28, 28, 0.8)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
