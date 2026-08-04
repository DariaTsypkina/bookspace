import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const pageSource = readFileSync(path.join(__dirname, 'page.tsx'), 'utf8');
const logoutSource = readFileSync(
  path.join(__dirname, '../../../components/logout-button.tsx'),
  'utf8',
);
const globalsSource = readFileSync(
  path.join(__dirname, '../../globals.css'),
  'utf8',
);

describe('Profile page Tailwind+shadcn migration (S11 / bd-wus.14)', () => {
  it('does not use legacy profile-stub class name on the page', () => {
    expect(pageSource).not.toMatch(/className=["']profile-stub["']/);
    expect(pageSource).not.toMatch(/\bprofile-stub\b/);
  });

  it('uses Tailwind layout utilities and theme tokens on the page', () => {
    expect(pageSource).toMatch(/\bflex\b/);
    expect(pageSource).toMatch(/\bflex-1\b/);
    expect(pageSource).toMatch(/text-foreground/);
    expect(pageSource).toMatch(/text-muted/);
  });

  it('uses shadcn Card on the page and Button in LogoutButton', () => {
    expect(pageSource).toMatch(/from ['"]@\/components\/ui\/card['"]/);
    expect(pageSource).toMatch(/\bCard\b/);
    expect(logoutSource).toMatch(/from ['"]@\/components\/ui\/button['"]/);
    expect(logoutSource).toMatch(/\bButton\b/);
    expect(logoutSource).not.toMatch(/className=["']logout-button["']/);
  });

  it('shows public collection from API (bd-cq7.1) with RU status/rating', () => {
    expect(pageSource).toMatch(/Профиль/);
    expect(pageSource).toMatch(/Публичная коллекция/);
    expect(pageSource).toMatch(/fetchPublicLibrary/);
    expect(pageSource).toMatch(/formatUserBookStatus/);
    expect(pageSource).toMatch(/formatUserBookRating/);
    expect(pageSource).toMatch(/Книги в коллекции/);
    expect(pageSource).toMatch(/\{slug\}/);
    expect(pageSource).toMatch(/LogoutButton/);
    expect(logoutSource).toMatch(/Выйти/);
    expect(logoutSource).toMatch(/action=["']\/api\/logout["']/);
    expect(logoutSource).toMatch(/method=["']post["']/);
  });

  it('validates slug via shared ProfileSlugParamSchema helper', () => {
    expect(pageSource).toMatch(/tryParseProfileSlug/);
    expect(pageSource).toMatch(/from ['"]@\/lib\/profile-slug['"]/);
    expect(pageSource).toMatch(/Профиль не найден/);
  });

  it('removes orphan .profile-stub / .logout-button rules from globals.css', () => {
    expect(globalsSource).not.toMatch(/\.profile-stub\b/);
    expect(globalsSource).not.toMatch(/\.logout-button\b/);
  });
});
