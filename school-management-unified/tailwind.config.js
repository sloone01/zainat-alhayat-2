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
        // FIKR brand — teal (logo accent). Single "action" colour per DESIGN.md.
        primary: {
          50: '#e6f7f6',
          100: '#c0eeeb',
          200: '#8adfd9',
          300: '#4cc9c1',
          400: '#1db3ab',
          500: '#00A19B', // logo teal
          600: '#00847f',
          700: '#066865',
          800: '#0a5350',
          900: '#0c4442',
        },
        // FIKR brand — navy (logo wordmark / dark tiles)
        navy: {
          50: '#eef2f8',
          100: '#d9e1ef',
          200: '#b3c3de',
          300: '#7f97c0',
          400: '#4c6a9c',
          500: '#2f4c7c',
          600: '#1c3866',
          700: '#132c56',
          800: '#0A2147', // logo navy
          900: '#071830',
          950: '#040e1c',
        },
        // DESIGN.md surface / ink tokens
        fikr: {
          canvas: '#ffffff',
          parchment: '#f5f5f7',
          ice: '#eef6f8',
          pearl: '#fafafc',
          surface: '#fbf9f9',
          'surface-low': '#f5f3f3',
          'surface-container': '#efeded',
          'surface-high': '#e9e8e7',
          ink: '#1d1d1f',
          'ink-muted': '#414753',
          'ink-soft': '#727784',
          hairline: '#e0e0e0',
          outline: '#c1c6d5',
          tile: '#0A2147',
          'on-tile': '#ffffff',
          'link-on-dark': '#7ee8e3',
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
          ink: '#0A2147',
          muted: '#5a7289',
          outline: '#b8ccd9',
          primary: '#00A19B',
          'primary-container': '#00847f',
          'on-primary-container': '#e8fffc',
          mint: '#d0f0ec',
          'on-mint': '#0A2147',
          charcoal: '#0A2147',
        },
      },
      fontFamily: {
        sans: ['Inter', '"Cairo"', '"Tajawal"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        hubDisplay: ['"Be Vietnam Pro"', '"Noto Sans Arabic"', 'sans-serif'],
        hubBody: ['"Work Sans"', '"Noto Sans Arabic"', 'sans-serif'],
      },
      maxWidth: {
        hub: '1280px',
        tile: '1440px',
        reading: '1024px',
      },
      borderRadius: {
        card: '10px',
        pill: '9999px',
      },
      fontSize: {
        'fk-hero': ['56px', { lineHeight: '1.07', letterSpacing: '-0.02em', fontWeight: '600' }],
        'fk-display-lg': ['40px', { lineHeight: '1.1', letterSpacing: '-0.01em', fontWeight: '600' }],
        'fk-display-md': ['32px', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '600' }],
        'fk-lead': ['28px', { lineHeight: '1.14', letterSpacing: '0.01em', fontWeight: '400' }],
        'fk-body': ['17px', { lineHeight: '1.47', letterSpacing: '-0.022em' }],
        'fk-caption': ['14px', { lineHeight: '1.43', letterSpacing: '-0.01em' }],
        'fk-nav': ['12px', { lineHeight: '1', letterSpacing: '-0.01em' }],
      },
      spacing: {
        'fk-md': '17px',
        'fk-section': '80px',
      },
      boxShadow: {
        product: 'rgba(0, 0, 0, 0.22) 3px 5px 30px 0',
        none: 'none',
        hub: '0 20px 40px -12px rgba(26, 176, 160, 0.15)',
        'hub-soft': '0 12px 28px -8px rgba(36, 59, 85, 0.08)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

