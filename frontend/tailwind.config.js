/** @type {import('tailwindcss').Config} */
const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/layouts/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: '#0f172a',
        'dark-secondary': '#1e293b',
        'dark-tertiary': '#334155',
        accent: '#2563eb',
        'accent-hover': '#1d4ed8',
      },
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
      },
      boxShadow: {
        navbar: '0 1px 3px 0 rgba(0,0,0,0.08), 0 2px 8px 0 rgba(0,0,0,0.05)',
        card: '0 1px 3px 0 rgba(0,0,0,0.06), 0 4px 16px 0 rgba(0,0,0,0.06)',
        'card-hover': '0 8px 30px 0 rgba(0,0,0,0.12)',
        'btn-primary': '0 4px 14px 0 rgba(37,99,235,0.35)',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
