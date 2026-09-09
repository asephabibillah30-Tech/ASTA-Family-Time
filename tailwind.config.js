/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        family: {
          yellow: '#FFD166',
          coral: '#FF6B6B',
          teal: '#4ECDC4',
          blue: '#118AB2',
          navy: '#073B4C',
          pink: '#FF85A1',
          purple: '#9B5DE5',
          green: '#06D6A0',
          orange: '#F77F00',
          cream: '#FFF9EB',
          lightBlue: '#E2F3F8',
          lightPink: '#FFE5EC',
        }
      },
      fontFamily: {
        bubble: ['"Plus Jakarta Sans"', 'Nunito', 'Poppins', 'sans-serif'],
        display: ['"Fredoka"', 'Quicksand', 'sans-serif'],
      },
      boxShadow: {
        'bubbly': '0 8px 0 rgba(0, 0, 0, 0.12), 0 15px 25px rgba(0, 0, 0, 0.08)',
        'bubbly-sm': '0 4px 0 rgba(0, 0, 0, 0.1), 0 8px 15px rgba(0, 0, 0, 0.05)',
        'bubbly-lg': '0 12px 0 rgba(0, 0, 0, 0.15), 0 25px 35px rgba(0, 0, 0, 0.1)',
        'bubbly-coral': '0 6px 0 #E04D4D, 0 12px 20px rgba(255, 107, 107, 0.25)',
        'bubbly-teal': '0 6px 0 #36B0A8, 0 12px 20px rgba(78, 205, 196, 0.25)',
        'bubbly-yellow': '0 6px 0 #E5BA50, 0 12px 20px rgba(255, 209, 102, 0.3)',
        'bubbly-purple': '0 6px 0 #7D43C2, 0 12px 20px rgba(155, 93, 229, 0.25)',
      },
      animation: {
        'bounce-slow': 'bounce 2.5s infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'pop-in': 'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        }
      }
    },
  },
  plugins: [],
}
