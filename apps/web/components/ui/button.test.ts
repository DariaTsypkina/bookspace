import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { buttonVariants } from './button';

describe('Button (shadcn baseline)', () => {
  it('default variant uses Bookspace accent tokens, not Material purple primary', () => {
    const classes = buttonVariants();
    expect(classes).toContain('bg-accent');
    expect(classes).not.toMatch(/bg-primary/);
    expect(classes).not.toMatch(/purple/);
  });

  it('outline variant uses surface/border tokens', () => {
    const classes = buttonVariants({ variant: 'outline' });
    expect(classes).toContain('border-border');
    expect(classes).toMatch(/bg-surface|bg-background/);
  });

  it('applies font-sans so Baskerville reaches button (bd-p3l UA stylesheet)', () => {
    expect(buttonVariants()).toContain('font-sans');
  });
});

describe('Input form control typography (bd-p3l)', () => {
  it('applies font-sans so Baskerville reaches input (UA stylesheet)', () => {
    const inputSource = readFileSync(path.join(__dirname, 'input.tsx'), 'utf8');
    expect(inputSource).toMatch(/\bfont-sans\b/);
  });
});

describe('shadcn baseline UI modules', () => {
  const uiDir = path.join(__dirname);

  it.each([
    'button.tsx',
    'input.tsx',
    'label.tsx',
    'card.tsx',
    'select.tsx',
  ] as const)('exports %s', (file) => {
    expect(existsSync(path.join(uiDir, file))).toBe(true);
  });
});

describe('shadcn baseline package deps (ADR 0003 F2)', () => {
  it('declares approved F2 packages', () => {
    const pkg = JSON.parse(
      readFileSync(path.join(__dirname, '../../package.json'), 'utf8'),
    ) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };

    const all = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
    };

    expect(all['lucide-react']).toBeDefined();
    expect(all['class-variance-authority']).toBeDefined();
    expect(all.clsx).toBeDefined();
    expect(all['tailwind-merge']).toBeDefined();
    expect(all['@radix-ui/react-slot']).toBeDefined();
    expect(all['@radix-ui/react-label']).toBeDefined();
    expect(all['@radix-ui/react-select']).toBeDefined();
  });
});
