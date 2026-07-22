import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const pageSource = readFileSync(path.join(__dirname, 'page.tsx'), 'utf8');
const globalsSource = readFileSync(
  path.join(__dirname, '../../globals.css'),
  'utf8',
);

describe('Auth error page Tailwind+shadcn migration (S4 / bd-wus.7)', () => {
  it('does not use legacy auth-* class names', () => {
    expect(pageSource).not.toMatch(/className=["']auth-page["']/);
    expect(pageSource).not.toMatch(/\bauth-error\b/);
    expect(pageSource).not.toMatch(/\bauth-form\b/);
    expect(pageSource).not.toMatch(/\bauth-divider\b/);
    expect(pageSource).not.toMatch(/\bauth-oauth\b/);
  });

  it('uses Tailwind layout utilities and theme tokens', () => {
    expect(pageSource).toMatch(/\bflex\b/);
    expect(pageSource).toMatch(/\bflex-1\b/);
    expect(pageSource).toMatch(/\bitems-center\b/);
    expect(pageSource).toMatch(/\bjustify-center\b/);
    expect(pageSource).toMatch(/text-foreground/);
    expect(pageSource).toMatch(/text-muted|text-\[color:var\(--error\)\]/);
  });

  it('uses shadcn Card and Button controls', () => {
    expect(pageSource).toMatch(/from ['"]@\/components\/ui\/card['"]/);
    expect(pageSource).toMatch(/from ['"]@\/components\/ui\/button['"]/);
    expect(pageSource).toMatch(/\bCard\b/);
    expect(pageSource).toMatch(/\bButton\b/);
  });

  it('keeps RU heading and OAuth error messages without regression', () => {
    expect(pageSource).toMatch(/<h1[^>]*>\s*Ошибка входа\s*<\/h1>/);
    expect(pageSource).toMatch(/role=["']alert["']/);
    expect(pageSource).toMatch(/Вход через \$\{name\} отменён/);
    expect(pageSource).toMatch(/Не удалось завершить вход через/);
    expect(pageSource).toMatch(/Ошибка авторизации/);
    expect(pageSource).toMatch(/Не удалось войти через/);
    expect(pageSource).toMatch(/Не удалось войти\. Попробуйте ещё раз/);
    expect(pageSource).toMatch(/Вернуться ко входу/);
    expect(pageSource).toMatch(/href=["']\/login["']/);
    expect(pageSource).toMatch(/providerLabel/);
    expect(pageSource).toMatch(/messageFor/);
  });

  it('removes orphan shared .auth-* rules from globals.css', () => {
    expect(globalsSource).not.toMatch(/\.auth-page\b/);
    expect(globalsSource).not.toMatch(/\.auth-form\b/);
    expect(globalsSource).not.toMatch(/\.auth-error\b/);
    expect(globalsSource).not.toMatch(/\.auth-divider\b/);
    expect(globalsSource).not.toMatch(/\.auth-oauth\b/);
    expect(globalsSource).not.toMatch(/\.auth-oauth-list\b/);
  });
});
