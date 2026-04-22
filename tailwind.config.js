/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0a',
        surface: '#111111',
        surfaceAlt: '#1a1a2e',
        'neon-blue': '#00d4ff',
        'neon-purple': '#7c3aed',
        'neon-cyan': '#06b6d4',
        'neon-pink': '#ec4899',
        gold: '#f59e0b',
        'gold-light': '#fcd34d',
        'rank-e': '#6b7280',
        'rank-d': '#22c55e',
        'rank-c': '#3b82f6',
        'rank-b': '#a855f7',
        'rank-a': '#f59e0b',
        'rank-s': '#ef4444',
      },
      fontFamily: {
        orbitron: ['Orbitron', 'monospace'],
        rajdhani: ['Rajdhani', 'sans-serif'],
        sans: ['Rajdhani', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 20px rgba(0, 212, 255, 0.4), 0 0 40px rgba(0, 212, 255, 0.1)',
        'neon-purple': '0 0 20px rgba(124, 58, 237, 0.4), 0 0 40px rgba(124, 58, 237, 0.1)',
        'neon-gold': '0 0 20px rgba(245, 158, 11, 0.4)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.5)',
      },
      backdropBlur: { xs: '2px' },
      animation: {
        'pulse-neon': 'pulseNeon 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'xp-fill': 'xpFill 1s ease-out forwards',
        'rank-glow': 'rankGlow 2s ease-in-out infinite',
        'particle': 'particle 1s ease-out forwards',
      },
      keyframes: {
        pulseNeon: {
          '0%, 100%': { opacity: 1, boxShadow: '0 0 20px rgba(0,212,255,0.4)' },
          '50%': { opacity: 0.7, boxShadow: '0 0 40px rgba(0,212,255,0.8)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        rankGlow: {
          '0%, 100%': { textShadow: '0 0 10px currentColor' },
          '50%': { textShadow: '0 0 30px currentColor, 0 0 60px currentColor' },
        },
      },
    },
  },
  plugins: [],
}
