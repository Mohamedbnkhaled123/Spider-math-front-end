/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts,scss}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--color-brand-primary)',
          secondary: 'var(--color-brand-secondary)',
          accent: 'var(--color-brand-accent)',
          dark: '#0f172a',
          navy: '#0b1329',
          cobalt: '#1e3a8a',
          cyan: '#0284c7',
          crimson: '#e11d48'
        },
        surface: {
          bg: 'var(--surface-bg)',
          card: 'var(--surface-card)',
          border: 'var(--surface-border)'
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)'
        }
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif']
      },
      boxShadow: {
        'glow-primary': '0 0 25px rgba(30, 58, 138, 0.25)',
        'glow-accent': '0 0 25px rgba(225, 29, 72, 0.25)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.08)'
      }
    },
  },
  plugins: [],
};
