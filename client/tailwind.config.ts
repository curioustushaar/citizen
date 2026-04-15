import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary: Vibrant Cyan - Trust, Technology, Government
        primary: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
        },
        // Accent: Electric Violet - AI, Intelligence, Innovation
        accent: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        // Surface: Deep Navy-Slate with blue undertone
        surface: {
          50: '#f0f4ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          700: '#1e293b',
          800: '#111827',
          900: '#0a0f1e',
          950: '#050810',
        },
        // Success: Emerald Green - Resolved, Positive
        success: {
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        // Warning: Warm Amber - Pending, Attention
        warning: {
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        // Danger: Rose Red - Escalated, Critical
        danger: {
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(6, 182, 212, 0.25), 0 0 40px rgba(6, 182, 212, 0.1)',
        'glow-lg': '0 0 40px rgba(6, 182, 212, 0.35), 0 0 80px rgba(6, 182, 212, 0.1)',
        'glow-accent': '0 0 20px rgba(139, 92, 246, 0.25), 0 0 40px rgba(139, 92, 246, 0.1)',
        'glow-danger': '0 0 20px rgba(244, 63, 94, 0.25)',
        'glow-success': '0 0 20px rgba(16, 185, 129, 0.25)',
        'glow-warning': '0 0 20px rgba(245, 158, 11, 0.2)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
        'glass-lg': '0 16px 48px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'mesh-gradient': 'radial-gradient(at 27% 37%, hsla(215, 98%, 61%, 0.06) 0px, transparent 50%), radial-gradient(at 97% 21%, hsla(267, 72%, 55%, 0.05) 0px, transparent 50%), radial-gradient(at 52% 99%, hsla(174, 68%, 42%, 0.04) 0px, transparent 50%)',
      },
      animation: {
        'glow-pulse': 'glowPulse 3s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer': 'shimmer 2.5s linear infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
        'pulse-ring': 'pulseRing 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
      },
      keyframes: {
        glowPulse: {
          '0%': { boxShadow: '0 0 5px rgba(6, 182, 212, 0.15)' },
          '100%': { boxShadow: '0 0 30px rgba(6, 182, 212, 0.4), 0 0 60px rgba(6, 182, 212, 0.1)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.95)', opacity: '1' },
          '50%': { transform: 'scale(1)', opacity: '0.7' },
          '100%': { transform: 'scale(0.95)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '33%': { transform: 'translateY(-6px) rotate(1deg)' },
          '66%': { transform: 'translateY(3px) rotate(-1deg)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
