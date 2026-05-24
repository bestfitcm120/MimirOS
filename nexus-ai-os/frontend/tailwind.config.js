/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nexus: {
          bg: '#0B0C10',
          surface: '#1F2833',
          border: '#45A29E',
          text: '#C5C6C7',
          accent: '#66FCF1',
          urgent: '#EF476F',
          pending: '#FFD166',
          success: '#06D6A0',
          project: '#118AB2',
          agent: '#9D4EDD',
          person: '#F4A261',
          engineering: '#2EC4B6',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
