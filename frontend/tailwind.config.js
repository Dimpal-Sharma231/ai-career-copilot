/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        saffron: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#ff9933', // Deep Indian Saffron
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        brand: {
          50: '#eef6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#0052cc', // Modern Indian Tech Blue (Razorpay / Zerodha style)
          600: '#0047b3',
          700: '#003d99',
          800: '#003380',
          900: '#002966',
        },
        accent: {
          saffron: '#FF9933',
          green: '#138808',
          cyan: '#06b6d4',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
        },
        dark: {
          bg: '#080B11',
          surface: '#0F1420',
          card: '#141B2D',
          hover: '#1B243C',
          border: 'rgba(255, 255, 255, 0.08)',
          muted: '#8B949E'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-sm': '0 0 15px -3px rgba(255, 153, 51, 0.25)',
        'glow': '0 0 25px -5px rgba(255, 153, 51, 0.35)',
        'glow-lg': '0 0 40px -10px rgba(255, 153, 51, 0.45)',
        'glow-blue': '0 0 25px -5px rgba(0, 82, 204, 0.35)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
