/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // WanderMap Palette
        primary: '#0F766E', // Teal 700 - Primary actions, map pins
        'primary-hover': '#0D6760',
        'primary-light': '#CCFBF1',
        secondary: '#F97316', // Coral / Orange 500 - CTAs, featured trips
        'secondary-hover': '#EA580C',
        'secondary-light': '#FFEDD5',
        tertiary: '#0EA5E9', // Sky Blue 500 - Links, sky accents
        'tertiary-light': '#E0F2FE',
        surface: '#FFFFFF',
        background: '#F8FAFC',
        success: '#059669',
        warning: '#D97706',
        error: '#EF4444',
        info: '#0EA5E9',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      },
      boxShadow: {
        'soft-sm': '0 2px 8px -2px rgba(15, 118, 110, 0.06), 0 1px 4px -1px rgba(0, 0, 0, 0.04)',
        'soft-md': '0 8px 24px -4px rgba(15, 118, 110, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.03)',
        'soft-xl': '0 20px 32px -8px rgba(15, 118, 110, 0.12), 0 8px 16px -4px rgba(0, 0, 0, 0.04)',
        'coral': '0 8px 20px -4px rgba(249, 115, 22, 0.40)',
        'teal': '0 8px 20px -4px rgba(15, 118, 110, 0.35)',
      },
    },
  },
  plugins: [],
}
