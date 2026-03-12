/** @type {import('tailwindcss').Config} */
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
        accent: '#3b82f6',
        'accent-hover': '#1d4ed8',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
