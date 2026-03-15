/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          bg:      '#faf7f2',
          surface: '#f0ebe3',
          border:  '#d4c5b0',
          primary: '#2c1810',
          accent:  '#9e4820',
          sage:    '#556b45',
          muted:   '#5c4038',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

