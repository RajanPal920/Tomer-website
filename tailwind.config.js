/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Official Tomar Enterprises Brand Colors (Sampled directly from /tomar-logo.png)
        brandBlue: {
          dark: '#041B44',
          DEFAULT: '#062E74', // Official logo wordmark deep navy blue
          royal: '#054793',   // Official logo emblem royal blue
          light: '#EBF3FC',   // Complementary light blue section background
          border: '#D0E2F7',  // Complementary light blue border
        },
        navy: {
          950: '#031435',
          900: '#041B44',
          DEFAULT: '#062E74', // Official Logo Wordmark Deep Navy
          800: '#073688',
          700: '#0A43A2',
          600: '#054793',
          500: '#0D5CA8',
          100: '#D0E2F7',
          50: '#EBF3FC',
        },
        royal: {
          DEFAULT: '#054793', // Official Logo Emblem Royal Blue
          dark: '#043A78',
          light: '#1A67C4',
          50: '#EBF3FC',
        },
        // Official Logo Emblem Bright Red
        brandRed: {
          900: '#7F1D1D',
          800: '#991B1B',
          DEFAULT: '#E5201C', // Official Logo Bright Red
          700: '#C91612',
          600: '#E5201C',
          500: '#EF4444',
          400: '#F87171',
          100: '#FEE2E2',
          50: '#FDF2F2',
        },
        red: {
          DEFAULT: '#E5201C',
          dark: '#C91612',
          light: '#FDF2F2',
        },
        // Clean Whites & Light Blues
        ivory: {
          DEFAULT: '#F8FAFC', // Clean crisp slate-tinted white
          light: '#FFFFFF',
          dark: '#F1F5F9',
        },
        stone: {
          DEFAULT: '#E2E8F0', // Subtle clean border
          light: '#F8FAFC',
          dark: '#CBD5E1',
        },
        charcoal: {
          DEFAULT: '#062E74', // Deep brand blue for important headings
          900: '#041B44',
          800: '#0F172A',
          700: '#1E293B',
          600: '#334155',
        },
        muted: {
          DEFAULT: '#64748B', // Neutral secondary text
          light: '#94A3B8',
          dark: '#475569',
        },
        // Strict Brand Alignment: Remap legacy gold to Royal Blue & Brand Red so no yellow/gold appears
        gold: {
          DEFAULT: '#054793', // Royal Blue
          light: '#EBF3FC',   // Light Blue
          dark: '#062E74',    // Deep Navy
          accent: '#E5201C',  // Brand Red
          50: '#F0F6FD',
        },
      },
      fontFamily: {
        serif: ['Inter', 'Arial', 'Helvetica', 'sans-serif'],
        sans: ['Inter', 'Arial', 'Helvetica', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 2px 10px rgba(6, 46, 116, 0.04)',
        'card': '0 8px 30px rgba(6, 46, 116, 0.07)',
        'elevated': '0 20px 40px rgba(6, 46, 116, 0.12)',
        'modal': '0 25px 60px -15px rgba(4, 27, 68, 0.35)',
        'brand': '0 10px 25px -5px rgba(229, 32, 28, 0.25)',
      }
    },
  },
  plugins: [],
}
