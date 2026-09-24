/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gel: {
          orange: '#c85a17',
          orangeDark: '#a34208',
          orangeLight: '#e67329',
          gray: '#8a8a8a',
          dark: '#1e293b'
        }
      }
    },
  },
  plugins: [],
}
