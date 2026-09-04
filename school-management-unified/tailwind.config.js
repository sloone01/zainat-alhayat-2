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
        // Platform hub (FIKR — smart school platform)
        hub: {
          bg: '#f7fafc',
          surface: '#ffffff',
          'surface-low': '#f0f5f8',
          'surface-container': '#e4edf2',
          ink: '#243b55',
          muted: '#5a7289',
          outline: '#b8ccd9',
          primary: '#1ab0a0',
          'primary-container': '#159688',
          'on-primary-container': '#e8fffc',
          mint: '#d0f0ec',
          'on-mint': '#243b55',
          charcoal: '#243b55',
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
        hub: '0 20px 40px -12px rgba(26, 176, 160, 0.15)',
        'hub-soft': '0 12px 28px -8px rgba(36, 59, 85, 0.08)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

