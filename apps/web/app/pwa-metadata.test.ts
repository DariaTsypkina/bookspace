import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const layoutSource = readFileSync(path.join(__dirname, 'layout.tsx'), 'utf8');

describe('Root layout PWA metadata (bd-6b7.1)', () => {
  it('declares themeColor for install chrome', () => {
    expect(layoutSource).toMatch(/export const viewport/);
    expect(layoutSource).toMatch(/themeColor/);
  });

  it('wires apple web app / touch icon for iOS A2HS', () => {
    expect(layoutSource).toMatch(/appleWebApp|apple:/);
    expect(layoutSource).toMatch(/icons\/icon-192\.png/);
  });

  it('points metadata at the web app manifest', () => {
    expect(layoutSource).toMatch(/manifest/);
  });
});
