/** Канон дизайн-токенов «читальня» для Tailwind theme и :root CSS variables. */

export const REQUIRED_TOKEN_KEYS = [
  'background',
  'foreground',
  'muted',
  'border',
  'surface',
  'accent',
] as const;

export type DesignTokenKey = (typeof REQUIRED_TOKEN_KEYS)[number];

const TOKEN_VALUES: Record<DesignTokenKey, string> = {
  background: '#f7f5f0',
  foreground: '#1c1917',
  muted: '#57534e',
  border: '#d6d3d1',
  surface: '#ffffff',
  accent: '#292524',
};

export const designTokens = {
  ...TOKEN_VALUES,
  /** Доп. токены, не обязательные в REQUIRED_TOKEN_KEYS, но живут в :root. */
  accentText: '#fafaf9',
  error: '#b42318',
  /** UI typeface (next/font Roboto → CSS var на html). */
  fontFamily: 'Roboto',
  fontFamilyCssVar: '--font-roboto',
  cssVar(key: DesignTokenKey): `--${DesignTokenKey}` {
    return `--${key}`;
  },
} as const;
