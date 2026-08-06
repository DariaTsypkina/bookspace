import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const pageSource = readFileSync(join(__dirname, 'page.tsx'), 'utf8');
const panelSource = readFileSync(
  join(__dirname, 'admin-catalog-panel.tsx'),
  'utf8',
);

describe('Admin catalog page', () => {
  it('gates the page with AdminOnly and mounts the panel', () => {
    expect(pageSource).toMatch(/AdminOnly/);
    expect(pageSource).toMatch(/AdminCatalogPanel/);
  });

  it('uses shadcn Select for ExternalId source and needsContext', () => {
    expect(panelSource).toMatch(/\bSelectTrigger\b/);
    expect(panelSource).toMatch(/\bSelectItem\b/);
    expect(panelSource).not.toMatch(/<select[\s>]/);
  });

  it('exposes publish, soft-delete and ExternalId controls', () => {
    expect(panelSource).toMatch(/Опубликовать/);
    expect(panelSource).toMatch(/soft-delete/);
    expect(panelSource).toMatch(/Внешние идентификаторы/);
    expect(panelSource).toMatch(/Источник ExternalId/);
    expect(panelSource).toMatch(/Ключ ExternalId/);
  });

  it('uses Link + buttonVariants, not Button asChild', () => {
    expect(panelSource).toMatch(/buttonVariants/);
    expect(panelSource).not.toMatch(/Button[\s\S]*asChild[\s\S]*Link/);
  });
});
