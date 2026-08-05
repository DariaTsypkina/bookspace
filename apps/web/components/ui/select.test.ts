import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const sourcePath = path.join(__dirname, 'select.tsx');
const source = () => readFileSync(sourcePath, 'utf8');

describe('Select (shadcn / bd-a12.2)', () => {
  it('exists as a client UI module on @radix-ui/react-select', () => {
    expect(existsSync(sourcePath)).toBe(true);
    const src = source();
    expect(src).toMatch(/'use client'/);
    expect(src).toMatch(/from ['"]@radix-ui\/react-select['"]/);
  });

  it('exports Select, SelectTrigger, SelectContent, SelectItem, SelectValue', () => {
    const src = source();
    expect(src).toMatch(/\bSelectTrigger\b/);
    expect(src).toMatch(/\bSelectContent\b/);
    expect(src).toMatch(/\bSelectItem\b/);
    expect(src).toMatch(/\bSelectValue\b/);
    expect(src).toMatch(/export \{/);
  });

  it('applies font-sans so Baskerville reaches Trigger/Content/Item', () => {
    const src = source();
    expect(src).toMatch(/SelectTrigger[\s\S]*?\bfont-sans\b/);
    expect(src).toMatch(/SelectContent[\s\S]*?\bfont-sans\b/);
    expect(src).toMatch(/SelectItem[\s\S]*?\bfont-sans\b/);
  });

  it('uses Bookspace surface/border tokens, not Material primary purple', () => {
    const src = source();
    expect(src).toMatch(/border-border/);
    expect(src).toMatch(/bg-surface|bg-background|bg-popover/);
    expect(src).not.toMatch(/bg-primary/);
    expect(src).not.toMatch(/purple/);
  });
});

describe('Select package dependency (bd-a12.2)', () => {
  it('declares @radix-ui/react-select in apps/web package.json', () => {
    const pkg = JSON.parse(
      readFileSync(path.join(__dirname, '../../package.json'), 'utf8'),
    ) as {
      dependencies?: Record<string, string>;
    };
    expect(pkg.dependencies?.['@radix-ui/react-select']).toBeDefined();
  });
});
