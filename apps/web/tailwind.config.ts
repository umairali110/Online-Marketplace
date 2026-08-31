import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2F5DE0',
          dark: '#1E3FAE',
        },
        navy: '#0B1B3A',
        success: '#16A34A',
        warning: '#F59E0B',
        danger: '#DC2626',
        surface: '#FFFFFF',
        bg: '#F7F8FA',
        border: '#E5E7EB',
        text: {
          primary: '#0F172A',
          muted: '#64748B',
        },
      },
      borderRadius: {
        card: '12px',
        btn: '8px',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;