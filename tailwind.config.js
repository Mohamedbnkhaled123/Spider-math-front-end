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
          'primary-hover': 'var(--color-brand-primary-hover)',
          secondary: 'var(--color-brand-secondary)',
          accent: 'var(--color-brand-accent)',
          magenta: 'var(--color-brand-magenta)',
          cobalt: 'var(--color-brand-cobalt)',
          // Direct hex constants from official logo
          violet: '#7C3AED',
          cyan: '#06B6D4',
          aqua: '#00F2FE',
          obsidian: '#060913',
          midnight: '#0B1021'
        },
        surface: {
          primary: 'var(--surface-bg-primary)',
          secondary: 'var(--surface-bg-secondary)',
          card: 'var(--surface-bg-card)',
          elevated: 'var(--surface-bg-elevated)',
          glass: 'var(--surface-glass)',
          border: 'var(--surface-border)',
          'border-glow': 'var(--surface-border-glow)',
          // Backward compatibility aliases
          bg: 'var(--surface-bg-primary)'
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)'
        },
        feedback: {
          success: 'var(--color-success)',
          warning: 'var(--color-warning)',
          danger: 'var(--color-danger)'
        }
      },
      fontFamily: {
        cairo: ['Cairo', 'Readex Pro', 'sans-serif'],
        jakarta: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        'brand-glow': 'var(--shadow-brand-glow)',
        'glow-primary': '0 0 25px rgba(109, 40, 217, 0.35)',
        'glow-secondary': '0 0 25px rgba(6, 182, 212, 0.35)',
        'glow-accent': '0 0 25px rgba(0, 242, 254, 0.45)',
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.12)'
      },
      zIndex: {
        'grid': '1',
        'content': '10',
        'shield': '20',
        'watermark': '25',
        'player': '30',
        'header': '40',
        'modal': '50'
      }
    },
  },
  plugins: [],
};
