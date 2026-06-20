import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Surfaces
        canvas: '#F5F4F1',
        surface: '#FFFFFF',
        // Text
        ink: '#111111',
        muted: '#5E5E5E',
        // Accent
        accent: '#0F5EFF',
        'accent-soft': '#D9E5FF',
        // Lines
        line: '#E6E6E6',
      },
      fontFamily: {
        display: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        content: '1400px',
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
      fontSize: {
        hero: ['clamp(3.25rem, 7vw, 7.5rem)', { lineHeight: '0.96', letterSpacing: '-0.04em' }],
        section: ['clamp(2.25rem, 4.5vw, 4.5rem)', { lineHeight: '1.02', letterSpacing: '-0.03em' }],
        sub: ['clamp(1.35rem, 2vw, 1.75rem)', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      boxShadow: {
        card: '0 1px 2px rgba(17,17,17,0.04), 0 12px 40px -12px rgba(17,17,17,0.10)',
        lift: '0 1px 2px rgba(17,17,17,0.04), 0 30px 60px -20px rgba(15,94,255,0.18)',
      },
    },
  },
  plugins: [],
};

export default config;
