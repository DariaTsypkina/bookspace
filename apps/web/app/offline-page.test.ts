import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Offline page (bd-6b7.2)', () => {
  it('exists as an App Router page with Russian offline copy', () => {
    const pagePath = join(__dirname, 'offline/page.tsx');
    const source = readFileSync(pagePath, 'utf8');
    expect(source).toMatch(/Нет сети|офлайн|offline/i);
    expect(source).toMatch(/Главн/i);
    expect(source).toMatch(/className=/);
  });
});
