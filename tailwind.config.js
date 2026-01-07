/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'film-gold': '#FFD700',
        'film-gold-dark': '#B8860B',
        'film-black': '#000000',
        'film-gray': '#1a1a1a',
        'film-gray-light': '#2a2a2a',
        'film-gray-dark': '#0a0a0a',
      },
    },
  },
  plugins: [],
}
