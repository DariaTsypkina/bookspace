import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const pageSource = readFileSync(path.join(__dirname, 'page.tsx'), 'utf8');

describe('Register page Tailwind+shadcn migration (S3 / bd-wus.6)', () => {
  it('uses RHF + zodResolver with shadcn Form pattern', () => {
    expect(pageSource).toMatch(/from ['"]react-hook-form['"]/);
    expect(pageSource).toMatch(/from ['"]@hookform\/resolvers\/zod['"]/);
    expect(pageSource).toMatch(/from ['"]@\/components\/ui\/form['"]/);
    expect(pageSource).toMatch(/\buseForm\b/);
    expect(pageSource).toMatch(/\bzodResolver\b/);
    expect(pageSource).toMatch(/\bFormField\b/);
    expect(pageSource).toMatch(/\bFormMessage\b/);
  });

  it('does not keep legacy local state submit handling', () => {
    expect(pageSource).not.toMatch(/\buseState\b/);
    expect(pageSource).not.toMatch(/\bFormEvent\b/);
  });

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
    expect(pageSource).toMatch(/\bFormLabel\b/);
    expect(pageSource).toMatch(/from ['"]@\/components\/ui\/button['"]/);
    expect(pageSource).toMatch(/\bCard\b/);
    expect(pageSource).toMatch(/\bInput\b/);
    expect(pageSource).toMatch(/\bFormLabel\b/);
    expect(pageSource).toMatch(/\bButton\b/);
  });

  it('uses PasswordInput for password visibility toggle (bd-957.5)', () => {
    expect(pageSource).toMatch(
      /from ['"]@\/components\/ui\/password-input['"]/,
    );
    expect(pageSource).toMatch(/\bPasswordInput\b/);
    expect(pageSource).not.toMatch(/type=["']password["']/);
  });

  it('keeps RU heading Регистрация and auth behavior hooks', () => {
    expect(pageSource).toMatch(/<h1[^>]*>\s*Регистрация\s*<\/h1>/);
    expect(pageSource).toMatch(/GuestOnly/);
    expect(pageSource).toMatch(/\bregister\b/);
    expect(pageSource).toMatch(/RegisterInputSchema/);
    expect(pageSource).toMatch(/\/api\/auth\/google/);
    expect(pageSource).toMatch(/\/api\/auth\/yandex/);
    expect(pageSource).toMatch(/href=["']\/login["']/);
  });
});
