import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#003d82',
          50: '#eaf2ff',
          100: '#d7e6ff',
          900: '#1b356b'
        },
        accent: {
          DEFAULT: '#ff6b35'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui']
      }
    }
  },
  plugins: [],
} satisfies Config;