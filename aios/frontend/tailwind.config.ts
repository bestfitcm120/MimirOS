/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // AIOS Design System
        base: '#0a0a0f',
        surface: '#111118',
        elevated: '#1a1a24',
        border: '#2a2a3a',
        'border-bright': '#3a3a50',
        accent: '#6366f1',
        'accent-dim': '#4f52c7',
        'accent-glow': 'rgba(99,102,241,0.15)',
        // Status colors
        danger: '#ff4444',
        warning: '#f59e0b',
        success: '#22c55e',
        info: '#3b82f6',
        agent: '#a855f7',
        engineering: '#06b6d4',
        person: '#f97316',
        // Text
        'text-primary': '#e2e8f0',
        'text-secondary': '#94a3b8',
        'text-muted': '#64748b',
        'text-dim': '#475569',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        display: ['"Space Grotesk"', '"DM Sans"', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-in-right': 'slideInRight 0.25s ease-out',
        'slide-in-left': 'slideInLeft 0.25s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0', transform: 'translateY(4px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideInRight: { from: { opacity: '0', transform: 'translateX(16px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        slideInLeft: { from: { opacity: '0', transform: 'translateX(-16px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        glow: { from: { boxShadow: '0 0 4px rgba(99,102,241,0.3)' }, to: { boxShadow: '0 0 12px rgba(99,102,241,0.6)' } },
      },
      backgroundImage: {
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='%232a2a3a' stroke-width='0.5'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'glow-accent': '0 0 20px rgba(99,102,241,0.25)',
        'glow-success': '0 0 12px rgba(34,197,94,0.2)',
        'glow-danger': '0 0 12px rgba(255,68,68,0.2)',
        'panel': '0 0 0 1px rgba(42,42,58,0.8), 0 4px 24px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
