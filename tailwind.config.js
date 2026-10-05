/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      colors: {
        // Charcoal & dark shades for high contrast navigation and admin panels
        charcoal: {
          DEFAULT: '#1C1917',
          subtle: '#292524',
          muted: '#44403C',
        },
        // Warm neutral palette
        ivory: {
          DEFAULT: '#FCF8F6',
          warm: '#F7F2EE',
          sand: '#EFE8E1',
        },
        cream: '#FAF5F2',
        blush: '#F8F0ED',
        rose: {
          muted: '#C4A08E',
          soft: '#D4B5A5',
          pale: '#F3EAE5',
        },
        ink: {
          DEFAULT: '#1C1917',
          soft: '#44403C',
          muted: '#78716C',
          faint: '#A8A29E',
          lightest: '#E7E5E4',
        },
        surface: {
          DEFAULT: '#FCF8F6',
          raised: '#FFFFFF',
          subtle: '#F5EFEB',
        },
        border: {
          DEFAULT: '#EDE8E4',
          subtle: '#F2EDEA',
        },
        accent: {
          DEFAULT: '#B86B57',
          dark: '#9E5542',
          light: '#F4ECE9',
        },
      },
      boxShadow: {
        'card': '0 1px 3px rgba(28, 25, 23, 0.04)',
        'card-hover': '0 4px 16px rgba(28, 25, 23, 0.08)',
        'elevated': '0 8px 32px rgba(28, 25, 23, 0.10)',
        'soft': '0 1px 2px rgba(28, 25, 23, 0.03)',
        'nav': '0 1px 0 rgba(28, 25, 23, 0.05)',
      },
      fontSize: {
        'display-lg': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display': ['2.75rem', { lineHeight: '1.15', letterSpacing: '-0.015em' }],
        'display-sm': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'heading': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'body-lg': ['1.0625rem', { lineHeight: '1.65' }],
        'body': ['0.9375rem', { lineHeight: '1.6' }],
        'body-sm': ['0.8125rem', { lineHeight: '1.5' }],
        'caption': ['0.75rem', { lineHeight: '1.5' }],
        'micro': ['0.6875rem', { lineHeight: '1.4' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      },
      borderRadius: {
        'sm': '4px',
        'DEFAULT': '6px',
        'md': '8px',
        'lg': '12px',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.5s ease forwards',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
