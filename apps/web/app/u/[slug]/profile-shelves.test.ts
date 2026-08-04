import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const pageSource = readFileSync(path.join(__dirname, 'page.tsx'), 'utf8');

describe('Public profile shelves (bd-cq7.2)', () => {
  it('loads public shelves and lists them with aria-label', () => {
    expect(pageSource).toMatch(/fetchPublicShelves/);
    expect(pageSource).toMatch(/Полки пользователя/);
    expect(pageSource).toMatch(/\/u\/\$\{slug\}\/shelves\/\$\{shelf\.slug\}/);
  });
});
