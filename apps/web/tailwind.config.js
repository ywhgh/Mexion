/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Mexion 主色：朱砂/纸墨
        primary: {
          50: '#fff7f3',
          100: '#fcefe9',
          200: '#f8d7ca',
          300: '#efb5a2',
          400: '#e27a67',
          500: '#c8392d',
          600: '#a82e22',
          700: '#84261e',
          800: '#64211b',
          900: '#421814',
          950: '#24100d'
        },
        accent: {
          50: '#faf9f4',
          100: '#f4f1e8',
          200: '#e8e1d1',
          300: '#d2c4aa',
          400: '#a99a82',
          500: '#7f735f',
          600: '#665b49',
          700: '#4c4337',
          800: '#332c24',
          900: '#211c16',
          950: '#14110d'
        },
        dark: {
          50: '#faf9f4',
          100: '#f4f1e8',
          200: '#e8e1d1',
          300: '#d2c4aa',
          400: '#a99a82',
          500: '#7f735f',
          600: '#665b49',
          700: '#4a4033',
          800: '#2b261f',
          900: '#1b1813',
          950: '#12100c'
        }
      },
      fontFamily: {
        sans: [
          'Geist',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'PingFang SC',
          'Hiragino Sans GB',
          'Microsoft YaHei',
          'sans-serif'
        ],
        mono: ['Geist Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        display: ['Newsreader', 'Iowan Old Style', 'Georgia', 'serif']
      },
      boxShadow: {
        glass: '0 12px 36px rgba(60, 40, 20, 0.08)',
        'glass-sm': '0 4px 16px rgba(60, 40, 20, 0.06)',
        glow: '0 0 20px rgba(200, 57, 45, 0.22)',
        'glow-lg': '0 0 40px rgba(200, 57, 45, 0.32)',
        card: '0 1px 3px rgba(20, 18, 14, 0.04), 0 1px 2px rgba(20, 18, 14, 0.06)',
        'card-hover': '0 16px 44px rgba(60, 40, 20, 0.10)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.28)'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #c8392d 0%, #84261e 100%)',
        'gradient-dark': 'linear-gradient(135deg, #2b261f 0%, #12100c 100%)',
        'gradient-glass':
          'linear-gradient(135deg, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.18) 100%)',
        'mesh-gradient':
          'radial-gradient(at 40% 20%, rgba(200, 57, 45, 0.10) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(181, 122, 27, 0.08) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(61, 122, 85, 0.06) 0px, transparent 50%)'
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 2s linear infinite',
        glow: 'glow 2s ease-in-out infinite alternate'
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideDown: { '0%': { opacity: '0', transform: 'translateY(-10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideInRight: { '0%': { opacity: '0', transform: 'translateX(20px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        scaleIn: { '0%': { opacity: '0', transform: 'scale(0.95)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        glow: { '0%': { boxShadow: '0 0 20px rgba(200, 57, 45, 0.22)' }, '100%': { boxShadow: '0 0 30px rgba(200, 57, 45, 0.36)' } }
      },
      backdropBlur: { xs: '2px' },
      borderRadius: { '4xl': '2rem' }
    }
  },
  plugins: []
}
