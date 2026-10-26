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
        cyber: {
          bg: '#080c10',
          surface: '#0d1318',
          card: '#121820',
          elevated: '#17202a',
          border: '#1f2937',
          borderLight: '#374151',
          textMuted: '#6b7280',
          textDim: '#9ca3af',
          textNormal: '#e5e7eb',
          textBright: '#f9fafb',
          green: '#10b981',
          greenDim: '#064e3b',
          greenGlow: 'rgba(16, 185, 129, 0.15)',
          amber: '#f59e0b',
          amberDim: '#78350f',
          red: '#ef4444',
          cyan: '#06b6d4',
          cyanDim: '#164e63',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'terminal': '0 0 15px -3px rgba(16, 185, 129, 0.15)',
        'cyber-card': '0 4px 20px -2px rgba(0, 0, 0, 0.7)',
        'amber-glow': '0 0 15px -3px rgba(245, 158, 11, 0.2)',
      }
    },
  },
  plugins: [],
}
