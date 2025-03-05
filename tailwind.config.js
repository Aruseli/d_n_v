/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Использование класса для темной темы
  theme: {
    extend: {
      colors: {
        // Можно добавить кастомные цвета для темной и светлой темы
        primary: {
          light: '#3b82f6', // синий для светлой темы
          dark: '#60a5fa',  // более светлый синий для темной темы
        },
      },
    },
  },
  plugins: [],
} 