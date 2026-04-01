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
        gold: {
          50:  '#fdf9ed',
          100: '#f9efcb',
          200: '#f3dc8e',
          300: '#ecc84f',
          400: '#e4b52a',
          500: '#C9A84C',
          600: '#b8891a',
          700: '#956816',
          800: '#7b5218',
          900: '#67441a',
        },
        charcoal: {
          50:  '#f7f6f5',
          100: '#edecea',
          200: '#d8d5d3',
          300: '#bab6b2',
          400: '#97928d',
          500: '#7c7772',
          600: '#5C5552',
          700: '#4a4441',
          800: '#3d3836',
          900: '#2C2C2C',
        },
        cream: '#FAFAF8',
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        body: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'gold': '0 4px 20px rgba(201, 168, 76, 0.25)',
        'gold-lg': '0 8px 40px rgba(201, 168, 76, 0.3)',
      },
    },
  },
  plugins: [],
};
