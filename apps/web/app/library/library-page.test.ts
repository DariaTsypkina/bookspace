import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const pageSource = readFileSync(path.join(__dirname, 'page.tsx'), 'utf8');
const globalsSource = readFileSync(
  path.join(__dirname, '../globals.css'),
  'utf8',
);

describe('Library page (bd-cq7.4 / Моя библиотека)', () => {
  it('does not use legacy library-stub class name on the page', () => {
    expect(pageSource).not.toMatch(/className=["']library-stub["']/);
    expect(pageSource).not.toMatch(/\blibrary-stub\b/);
  });

  it('uses Tailwind layout utilities and theme tokens on the page', () => {
    expect(pageSource).toMatch(/\bflex\b/);
    expect(pageSource).toMatch(/\bflex-1\b/);
    expect(pageSource).toMatch(/text-foreground/);
  });

  it('keeps RU heading and mounts LibraryCabinet', () => {
    expect(pageSource).toMatch(/Моя библиотека/);
    expect(pageSource).toMatch(/LibraryCabinet/);
    expect(pageSource).toMatch(/from ['"]\.\/library-cabinet['"]/);
  });

  it('cabinet links shelves + goal and mounts collection + add form', () => {
    const cabinetSource = readFileSync(
      path.join(__dirname, 'library-cabinet.tsx'),
      'utf8',
    );
    expect(cabinetSource).toMatch(/Мои полки/);
    expect(cabinetSource).toMatch(/\/library\/shelves/);
    expect(cabinetSource).toMatch(/Цель на год/);
    expect(cabinetSource).toMatch(/\/library\/goal/);
    expect(cabinetSource).toMatch(/LibraryCollection/);
    expect(cabinetSource).toMatch(/AddLibraryItemForm/);
    expect(cabinetSource).toMatch(/LogoutButton/);
  });

  it('removes orphan .library-stub rules from globals.css', () => {
    expect(globalsSource).not.toMatch(/\.library-stub\b/);
  });

  it('drops stub placeholder copy; keeps mobile padding', () => {
    expect(pageSource).not.toMatch(/Коллекция и фильтры появятся здесь/);
    expect(pageSource).toMatch(/\bpt-5\b/);
    expect(pageSource).toMatch(/\bpx-4\b/);
  });
});
