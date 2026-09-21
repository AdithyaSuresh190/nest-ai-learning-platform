/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        nest: {
          // Soft pastel blue
          blue: {
            50: '#f0f7ff',
            100: '#e0effe',
            200: '#bae0fd',
            300: '#7cc5fb',
            400: '#36a9f6',
            500: '#0c8de7',
            600: '#006fc5',
            700: '#01589f',
            800: '#064c83',
            900: '#0b416d',
          },
          // Soft pastel green
          green: {
            50: '#f1fcf3',
            100: '#e0f8e6',
            200: '#c2f0cf',
            300: '#97e3aa',
            400: '#65cd7c',
            500: '#43b25c',
            600: '#339149',
            700: '#2b743c',
            800: '#265c34',
            900: '#214d2e',
          },
          // Soft lavender
          lavender: {
            50: '#f8f6ff',
            100: '#f0ebff',
            200: '#e2d8ff',
            300: '#ccb8ff',
            400: '#b48eff',
            500: '#9d66ff',
            600: '#8c43f5',
            700: '#7c32d8',
            800: '#682caE',
            900: '#5a2bb8',
          },
          // Soft peach
          peach: {
            50: '#fff7f0',
            100: '#ffeede',
            200: '#fed9bd',
            300: '#fdba8e',
            400: '#fc9358',
            500: '#fa7534',
            600: '#eb5d20',
            700: '#c2491c',
            800: '#9a3c1d',
            900: '#7d341c',
          },
          // Soft yellow
          yellow: {
            50: '#fffdf0',
            100: '#fff9d6',
            200: '#fff0a8',
            300: '#ffe567',
            400: '#ffd93b',
            500: '#fbc515',
            600: '#eaa404',
            700: '#c47e06',
            800: '#9e620c',
            900: '#804f10',
          },
        },
      },
      fontFamily: {
        sans: ['Lexend', 'system-ui', 'sans-serif'],
        dyslexic: ['"OpenDyslexic"', 'Comic Sans MS', 'sans-serif'],
      },
      fontSize: {
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      borderRadius: {
        'xl': '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        'soft': '0 2px 12px rgba(0,0,0,0.06)',
        'card': '0 4px 20px rgba(0,0,0,0.08)',
        'glow-blue': '0 0 20px rgba(124,197,251,0.4)',
        'glow-green': '0 0 20px rgba(151,227,170,0.4)',
        'glow-lavender': '0 0 20px rgba(204,184,255,0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'bounce-soft': 'bounceSoft 1.5s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'wiggle': 'wiggle 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-3deg)' },
          '75%': { transform: 'rotate(3deg)' },
        },
      },
    },
  },
  plugins: [],
};
