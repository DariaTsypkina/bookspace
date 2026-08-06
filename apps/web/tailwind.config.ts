import type { Config } from 'tailwindcss';
import { REQUIRED_TOKEN_KEYS } from './lib/design-tokens';

const themeColors = Object.fromEntries(
  REQUIRED_TOKEN_KEYS.map((key) => [key, `var(--${key})`]),
) as Record<(typeof REQUIRED_TOKEN_KEYS)[number], string>;

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // Theme utilities available before screens migrate off legacy CSS.
  safelist: REQUIRED_TOKEN_KEYS.flatMap((key) => [
    `bg-${key}`,
    `text-${key}`,
    `border-${key}`,
  ]),
  // Preflight сбрасывает legacy globals.css — включаем после миграции экранов.
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: themeColors,
      fontFamily: {
        sans: ['var(--font-baskerville)', 'system-ui', 'sans-serif'],
      },
      // Baskerville woff2: только 400/700 — medium без faux 500.
      fontWeight: {
        medium: '400',
      },
    },
  },
  plugins: [],
};

export default config;
