import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: '#0f0f0f',
        surface: '#1f1f1f',
        'surface-2': '#272727',
        brand: '#ff0033',
        muted: '#aaaaaa',
      },
      maxWidth: {
        content: '1600px',
      },
    },
  },
  plugins: [],
};

export default config;
