/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf4f0',
          100: '#fce8de',
          200: '#f8ccb8',
          300: '#f3a886',
          400: '#ec7a4e',
          500: '#e55a28',
          600: '#d4411a',
          700: '#b03116',
          800: '#8c2918',
          900: '#722518',
        },
        slate: {
          950: '#0a0f1e',
        }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'hero-pattern': "radial-gradient(ellipse at 20% 50%, rgba(229,90,40,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(180,50,20,0.1) 0%, transparent 50%)",
      }
    },
  },
  plugins: [],
}
