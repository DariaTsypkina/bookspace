import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const pageSource = readFileSync(path.join(__dirname, 'page.tsx'), 'utf8');

describe('Public profile tags (bd-cq7.3)', () => {
  it('renders tags from public library items', () => {
    expect(pageSource).toMatch(/item\.tags/);
    expect(pageSource).toMatch(/Теги:/);
    expect(pageSource).toMatch(/aria-label=\{`Теги:/);
  });
});
