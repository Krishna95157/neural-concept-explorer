/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#dde8ff',
          200: '#c3d3fc',
          400: '#6e8efb',
          500: '#4f6cf5',
          600: '#3a53e0',
          700: '#2c40c8',
          900: '#1a2580',
        },
      },
    },
  },
  plugins: [],
}

