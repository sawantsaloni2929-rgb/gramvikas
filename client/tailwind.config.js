/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          850: '#19542a',
          900: '#14532d',
          950: '#052e16',
        },
        cream: {
          50: '#fdfbf7',
          100: '#f9f6ee',
          200: '#f3ede0',
          300: '#eae0cc',
          400: '#dccdb0',
          500: '#c5b08c',
          600: '#ab936f',
          700: '#8c7657',
          800: '#726049',
          900: '#5e4f3d',
        },
        earth: {
          50: '#fbf8f3',
          100: '#f5efe4',
          200: '#ebdcc7',
          300: '#dec2a2',
          400: '#ce9f75',
          500: '#bf8353',
          600: '#ad6e44',
          700: '#8d5538',
          800: '#734633',
          900: '#603b2e',
        },
        terracotta: {
          500: '#c2410c',
          600: '#9a3412',
          700: '#7c2d12',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Devanagari', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
