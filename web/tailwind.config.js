/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte}'],
  darkMode: 'media',
  theme: {
    extend: {
      // Design tokens (see README "Design").
      colors: {
        primary: {
          DEFAULT: '#247FFF',
          soft: '#EAF3FF',
          deep: '#1F6FE0'
        },
        surface: '#F7FAFF',
        textmain: '#0F172A',
        textmuted: '#64748B',
        bordersoft: '#DCEBFF',
        success: '#16A34A',
        warning: '#F59E0B',
        danger: '#EF4444'
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Thai', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace']
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem'
      },
      boxShadow: {
        soft: '0 18px 50px -24px rgba(36,127,255,0.45)',
        card: '0 2px 18px -8px rgba(15,23,42,0.10)'
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' }
        },
        pulseSoft: {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.55' }
        }
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        pulseSoft: 'pulseSoft 2.4s ease-in-out infinite'
      }
    }
  },
  plugins: []
};
