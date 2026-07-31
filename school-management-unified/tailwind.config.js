/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand colors derived from the logo
        primary: {
          50: '#f0fdf9',
          100: '#dcfce8',
          200: '#bbf7d1',
          300: '#86efac',
          400: '#5a9b8e', // Main logo color
          500: '#4a8b7e',
          600: '#3a7b6e',
          700: '#2a6b5e',
          800: '#1a5b4e',
          900: '#0a4b3e',
        },
        // Secondary colors from logo
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#6b7280', // Logo gray color
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        // Kindergarten brand colors
        kindergarten: {
          50: '#f0fdf9',
          100: '#dcfce8',
          200: '#bbf7d1',
          300: '#86efac',
          400: '#5a9b8e',
          500: '#4a8b7e',
          600: '#3a7b6e',
          700: '#2a6b5e',
          800: '#1a5b4e',
          900: '#0a4b3e',
        },
        // Accent teal colors
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        // Platform hub (Academic Clarity / Stitch)
        hub: {
          bg: '#f8f9fc',
          surface: '#f8f9fc',
          'surface-low': '#f2f4f6',
          'surface-container': '#eceef0',
          ink: '#191c1e',
          muted: '#3f4946',
          outline: '#bfc9c4',
          primary: '#1d6557',
          'primary-container': '#3a7e6f',
          'on-primary-container': '#e5fff6',
          mint: '#c9eadd',
          'on-mint': '#4d6a60',
          charcoal: '#2e3133',
        },
      },
      fontFamily: {
        hubDisplay: ['"Be Vietnam Pro"', '"Noto Sans Arabic"', 'sans-serif'],
        hubBody: ['"Work Sans"', '"Noto Sans Arabic"', 'sans-serif'],
      },
      maxWidth: {
        hub: '1280px',
      },
      boxShadow: {
        hub: '0 20px 40px -12px rgba(29, 101, 87, 0.12)',
        'hub-soft': '0 12px 28px -8px rgba(29, 101, 87, 0.08)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

