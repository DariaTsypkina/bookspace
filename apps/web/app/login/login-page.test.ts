import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const pageSource = readFileSync(path.join(__dirname, 'page.tsx'), 'utf8');

describe('Login page Tailwind+shadcn migration (S2 / bd-wus.5)', () => {
  it('does not use legacy auth-page / auth-form class names', () => {
    expect(pageSource).not.toMatch(/className=["']auth-page["']/);
    expect(pageSource).not.toMatch(/className=["']auth-form["']/);
    expect(pageSource).not.toMatch(/\bauth-error\b/);
    expect(pageSource).not.toMatch(/\bauth-divider\b/);
    expect(pageSource).not.toMatch(/\bauth-oauth\b/);
  });

  it('uses Tailwind layout utilities and theme tokens', () => {
    expect(pageSource).toMatch(/\bflex\b/);
    expect(pageSource).toMatch(/\bflex-1\b/);
    expect(pageSource).toMatch(/\bitems-center\b/);
    expect(pageSource).toMatch(/\bjustify-center\b/);
    expect(pageSource).toMatch(/text-foreground/);
    expect(pageSource).toMatch(/text-muted/);
  });

  it('uses shadcn Card, Input, Label, Button controls', () => {
    expect(pageSource).toMatch(/from ['"]@\/components\/ui\/card['"]/);
    expect(pageSource).toMatch(/from ['"]@\/components\/ui\/input['"]/);
    expect(pageSource).toMatch(/from ['"]@\/components\/ui\/label['"]/);
    expect(pageSource).toMatch(/from ['"]@\/components\/ui\/button['"]/);
    expect(pageSource).toMatch(/\bCard\b/);
    expect(pageSource).toMatch(/\bInput\b/);
    expect(pageSource).toMatch(/\bLabel\b/);
    expect(pageSource).toMatch(/\bButton\b/);
  });

  it('keeps RU heading Вход and auth behavior hooks', () => {
    expect(pageSource).toMatch(/<h1[^>]*>\s*Вход\s*<\/h1>/);
    expect(pageSource).toMatch(/GuestOnly/);
    expect(pageSource).toMatch(/\blogin\b/);
    expect(pageSource).toMatch(/\/api\/auth\/google/);
    expect(pageSource).toMatch(/\/api\/auth\/yandex/);
    expect(pageSource).toMatch(/href=["']\/register["']/);
  });
});
