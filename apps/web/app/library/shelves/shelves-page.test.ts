import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const pageSource = readFileSync(path.join(__dirname, 'page.tsx'), 'utf8');
const managerSource = readFileSync(
  path.join(__dirname, 'shelves-manager.tsx'),
  'utf8',
);

describe('Library shelves page (bd-cq7.2)', () => {
  it('uses Tailwind + Card and RU heading Полки', () => {
    expect(pageSource).toMatch(/Полки/);
    expect(pageSource).toMatch(/text-foreground/);
    expect(pageSource).toMatch(/ShelvesManager/);
    expect(pageSource).toMatch(/from ['"]\.\/shelves-manager['"]/);
  });

  it('manager creates via BFF /api/me/shelves and shows empty state', () => {
    expect(managerSource).toMatch(/\/api\/me\/shelves/);
    expect(managerSource).toMatch(/Создать полку/);
    expect(managerSource).toMatch(/Пока нет полок/);
    expect(managerSource).toMatch(/Название полки/);
    expect(managerSource).toMatch(/font-sans/);
  });
});
