/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#121212',
          charcoal: '#1E1E1E',
          red: '#DC2626',
          darkred: '#991B1B',
          lightred: '#FEE2E2',
          surface: '#F9FAFB',
          border: '#E5E7EB',
          muted: '#6B7280',
          silver: '#9CA3AF'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

