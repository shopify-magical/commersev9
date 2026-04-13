// tailwind.config.js - Optimized version
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    screens: {
      'xs': '475px',      // Small phones
      'sm': '640px',      // Large phones
      'md': '768px',      // Tablets
      'lg': '1024px',     // Laptops
      'xl': '1280px',     // Desktops
      '2xl': '1536px',    // Large screens
      '3xl': '1920px',    // Ultra wide
    },
    extend: {
      colors: {
        // Primary Brand Colors
        primary: {
          DEFAULT: '#2A6B52', // Jade Green
          dark: '#1F4A3A',
          light: '#E8F5F0',
          50: '#E8F5F0',
          100: '#C8E8DC',
          200: '#98D4C0',
          300: '#68B89C',
          400: '#3D8B6B',
          500: '#2A6B52',
          600: '#1F4A3A',
          700: '#163D30',
          800: '#0D2A22',
          900: '#061A14',
        },
        // Gold Accent
        gold: {
          DEFAULT: '#C4A647',
          400: '#C4A647',
          500: '#B3941A',
        },
        // Cream/Neutral
        cream: {
          DEFAULT: '#FDF9F5',
          50: '#FDF9F5',
          100: '#F5EDE4',
          200: '#E8DCD0',
          300: '#D4C4B5',
          400: '#B8A08A',
          500: '#9A7D6A',
          600: '#7A5F4A',
          700: '#5A4535',
          800: '#3D2E22',
          900: '#241A12',
        },
        // Status Colors
        success: {
          DEFAULT: '#16a34a',
          light: '#22c55e',
        },
        error: {
          DEFAULT: '#ef4444',
        },
        warning: {
          DEFAULT: '#f59e0b',
        },
        info: {
          DEFAULT: '#2563eb',
          light: '#3b82f6',
        },
        // Luxury Palette
        luxury: {
          charcoal: {
            50: '#F8F8F8',
            100: '#E0E0E0',
            200: '#BDBDBD',
            300: '#9E9E9E',
            400: '#757575',
            500: '#616161',
            600: '#424242',
            700: '#2D2D2D',
            800: '#1A1A1A',
            900: '#0A0A0A',
          },
          burgundy: {
            50: '#FFF5F5',
            100: '#FDE8E8',
            200: '#F5C6C6',
            300: '#E89A9A',
            400: '#D46666',
            500: '#B83A3A',
            600: '#8B2828',
            700: '#5E1A1A',
            800: '#3A0E0E',
            900: '#4A0E0E',
          },
          midnight: {
            50: '#EBF8FF',
            100: '#D1E8FF',
            200: '#A3D3FF',
            300: '#6BB5FF',
            400: '#3D8BFF',
            500: '#1A5CFF',
            600: '#0A3CAA',
            700: '#062A80',
            800: '#031A55',
            900: '#0A2540',
          },
          champagne: {
            50: '#FFFAF5',
            100: '#FDF0E6',
            200: '#FCE0CC',
            300: '#F9CAA8',
            400: '#F5AD7A',
            500: '#E88A4A',
            600: '#C46830',
            700: '#9A4A1A',
            800: '#6B3410',
            900: '#4A2008',
          },
        },
      },
      fontFamily: {
        // Display fonts for headings
        display: ['Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Inter', 'SF Pro Text', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'monospace'],
        accent: ['Cormorant', 'Playfair Display', 'serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.01em' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.01em' }],
        'base': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.02em' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.02em' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.02em' }],
        '5xl': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        '6xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      },
      maxWidth: {
        'xs': '20rem',     // 320px
        'sm': '24rem',     // 384px
        'md': '28rem',     // 448px
        'lg': '32rem',     // 512px
        'xl': '36rem',     // 576px
        '2xl': '42rem',    // 672px
        '3xl': '48rem',    // 768px
        '4xl': '56rem',    // 896px
        '5xl': '64rem',    // 1024px
        '6xl': '72rem',    // 1152px
        '7xl': '80rem',    // 1280px
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'gold': '0 4px 14px 0 rgba(196, 166, 71, 0.15)',
        'gold-lg': '0 10px 25px -3px rgba(196, 166, 71, 0.2)',
        'jade': '0 4px 14px 0 rgba(42, 107, 82, 0.15)',
        'luxury': '0 20px 35px -10px rgba(0, 0, 0, 0.1)',
      },
      backgroundImage: {
        'gradient-jade': 'linear-gradient(135deg, #2A6B52 0%, #1F4A3A 100%)',
        'gradient-gold': 'linear-gradient(135deg, #C4A647 0%, #B3941A 100%)',
        'gradient-luxury': 'linear-gradient(135deg, #2D2D2D 0%, #1A1A1A 100%)',
      },
    },
  },
  plugins: [],
}
