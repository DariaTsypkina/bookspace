import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const pageSource = readFileSync(path.join(__dirname, 'page.tsx'), 'utf8');

describe('Rankings stub page (bd-0t0.10)', () => {
  it('uses shared rankings stub copy helper and has no forms', () => {
    expect(pageSource).toMatch(/from ['"]@\/lib\/rankings['"]/);
    expect(pageSource).toMatch(/RANKINGS_STUB_COPY/);
    expect(pageSource).toMatch(/Рейтинги/);
    expect(pageSource).not.toMatch(/useForm|zodResolver|FormField/);
    expect(pageSource).not.toMatch(/<form\b/);
    expect(pageSource).not.toMatch(/class-validator/);
  });
});
