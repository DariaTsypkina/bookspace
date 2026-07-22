import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { REQUIRED_TOKEN_KEYS } from './lib/design-tokens';
import tailwindConfig from './tailwind.config';

describe('tailwind foundation config', () => {
  it('maps reading-room tokens into theme colors via CSS variables', () => {
    const colors = tailwindConfig.theme?.extend?.colors as
      Record<string, string> | undefined;

    expect(colors).toBeDefined();
    for (const key of REQUIRED_TOKEN_KEYS) {
      expect(colors?.[key]).toBe(`var(--${key})`);
    }
  });

  it('disables preflight so legacy globals.css keeps working', () => {
    expect(tailwindConfig.corePlugins).toEqual({ preflight: false });
  });

  it('safelists theme color utilities for cn-ready foundation', () => {
    const safelist = tailwindConfig.safelist as string[];
    expect(safelist).toEqual(
      expect.arrayContaining([
        'bg-background',
        'text-foreground',
        'border-border',
        'bg-surface',
        'text-muted',
        'bg-accent',
      ]),
    );
  });

  it('scans app, components, and lib for class names', () => {
    const content = tailwindConfig.content as string[];
    expect(content).toEqual(
      expect.arrayContaining([
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './lib/**/*.{js,ts,jsx,tsx,mdx}',
      ]),
    );
  });
});

describe('tailwind foundation package deps (ADR 0003 F1)', () => {
  it('keeps approved F1 tooling packages', () => {
    const pkg = JSON.parse(
      readFileSync(path.join(__dirname, 'package.json'), 'utf8'),
    ) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };

    const all = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
    };

    expect(all.tailwindcss).toBeDefined();
    expect(all.postcss).toBeDefined();
    expect(all.autoprefixer).toBeDefined();
  });
});
