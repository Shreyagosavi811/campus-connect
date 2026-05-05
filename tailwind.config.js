/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0F172A',
          light: '#334155',
          dark: '#020617',
        },
        secondary: {
          DEFAULT: '#4F46E5',
          light: '#818CF8',
          dark: '#3730A3',
        },
      },
      borderRadius: {
        'premium': '1rem',
      }
    },
  },
  important: '#root', // To ensure Tailwind classes can override MUI styles if needed
  plugins: [],
}
