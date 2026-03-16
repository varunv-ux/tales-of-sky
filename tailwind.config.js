module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Overused Grotesk"', 'system-ui', 'sans-serif'],
      },
      colors: {
        taupe: {
          50:  '#fbfaf9',
          100: '#f5f3f2',
          150: '#eeedeb',
          200: '#e8e5e3',
          300: '#d6d2cf',
          400: '#aca7a2',
          500: '#827a74',
          600: '#686260',
          700: '#564f4d',
          800: '#3d3837',
          900: '#302c2b',
          950: '#1f1c1b',
        },
      },
    },
  },
  plugins: [],
}
