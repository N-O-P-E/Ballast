/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: 'var(--nope-bg)',
          secondary: 'var(--nope-bg-secondary)',
          tertiary: 'var(--nope-bg-tertiary)',
          card: 'var(--nope-bg)',
        },
        accent: {
          primary: 'var(--nope-accent)',
          secondary: 'var(--nope-accent-secondary)',
          success: 'var(--nope-accent-green)',
          warning: 'var(--nope-accent-orange)',
          danger: 'var(--nope-accent-red)',
          info: 'var(--nope-accent-blue)',
        },
        text: {
          primary: 'var(--nope-text-primary)',
          secondary: 'var(--nope-text-secondary)',
          muted: 'var(--nope-text-tertiary)',
        },
        border: {
          DEFAULT: 'var(--nope-border)',
          hover: 'var(--nope-border-hover)',
        },
      },
      fontFamily: {
        display: ['"Geist Sans"', '"DM Sans"', 'system-ui', 'sans-serif'],
        body: ['"Geist Sans"', '"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"DM Mono"', '"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'fade-in': 'fade-in 0.4s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'fire': 'fire 0.5s ease-in-out infinite alternate',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(91, 108, 247, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(91, 108, 247, 0.6)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'fire': {
          '0%': { transform: 'scale(1) rotate(-5deg)' },
          '100%': { transform: 'scale(1.1) rotate(5deg)' },
        },
      },
    },
  },
  plugins: [],
}
