/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg:      '#faf7f2',
          surface: '#f0ebe3',
          border:  '#d4c5b0',
          primary: '#2c1810',
          accent:  '#c2622d',
          sage:    '#6b7c5c',
          muted:   '#8a7468',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

