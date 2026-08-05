/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        deepNavyBlue: '#001f3f',
        goldenYellow: '#FFD700',
        'navy-primary': 'var(--navy-primary)',
        'navy-secondary': 'var(--navy-secondary)',
        'navy-dark': 'var(--navy-dark)',
        'navy-light': 'var(--navy-light)',
        'gold-primary': 'var(--gold-primary)',
        'gold-secondary': 'var(--gold-secondary)',
        'gold-light': 'var(--gold-light)',
        'success': 'var(--success)',
        'warning': 'var(--warning)',
        'error': 'var(--error)',
        'info': 'var(--info)',
        black: '#000000',
        white: '#FFFFFF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'responsive-2xs': ['clamp(0.5rem, 1.2vw, 0.625rem)', { lineHeight: '1.2' }],
        'responsive-xs': ['clamp(0.625rem, 1.5vw, 0.75rem)', { lineHeight: '1.2' }],
        'responsive-sm': ['clamp(0.75rem, 2vw, 0.875rem)', { lineHeight: '1.4' }],
        'responsive-base': ['clamp(0.875rem, 2.5vw, 1rem)', { lineHeight: '1.5' }],
        'responsive-lg': ['clamp(1rem, 3vw, 1.125rem)', { lineHeight: '1.5' }],
        'responsive-xl': ['clamp(1.125rem, 3.5vw, 1.25rem)', { lineHeight: '1.4' }],
        'responsive-2xl': ['clamp(1.25rem, 4vw, 1.5rem)', { lineHeight: '1.3' }],
        'responsive-3xl': ['clamp(1.5rem, 5vw, 1.875rem)', { lineHeight: '1.3' }],
        'responsive-4xl': ['clamp(1.875rem, 6vw, 2.25rem)', { lineHeight: '1.2' }],
        'responsive-5xl': ['clamp(2.25rem, 7vw, 3rem)', { lineHeight: '1.1' }],
        'responsive-6xl': ['clamp(3rem, 8vw, 4rem)', { lineHeight: '1.1' }],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      screens: {
        'xs': '475px',
        '3xl': '1600px',
      },
    },
  },
  plugins: [],
}
