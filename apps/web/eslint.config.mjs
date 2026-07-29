import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const FETCH_RESTRICT_MESSAGE =
  'Use apps/web/lib/http (axios). Native fetch is allowed only in public/sw.js and app/api/**/route.ts (ADR 0005).';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    rules: {
      'no-restricted-globals': [
        'error',
        {
          name: 'fetch',
          message: FETCH_RESTRICT_MESSAGE,
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "CallExpression[callee.object.name='globalThis'][callee.property.name='fetch']",
          message: FETCH_RESTRICT_MESSAGE,
        },
        {
          selector:
            "CallExpression[callee.object.name='window'][callee.property.name='fetch']",
          message: FETCH_RESTRICT_MESSAGE,
        },
      ],
    },
  },
  {
    // ADR 0005: Service Worker + Next BFF-proxy keep native fetch.
    files: ['public/sw.js', 'app/api/**/route.ts'],
    rules: {
      'no-restricted-globals': 'off',
      'no-restricted-syntax': 'off',
    },
  },
]);

export default eslintConfig;
