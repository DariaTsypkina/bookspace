import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const pageSource = readFileSync(join(__dirname, 'page.tsx'), 'utf8');
const panelSource = readFileSync(
  join(__dirname, 'admin-work-merge-panel.tsx'),
  'utf8',
);

describe('Admin work merge page', () => {
  it('gates the page with AdminOnly and mounts the merge panel', () => {
    expect(pageSource).toMatch(/AdminOnly/);
    expect(pageSource).toMatch(/AdminWorkMergePanel/);
  });

  it('warns that merge is irreversible and uses two-step confirm', () => {
    expect(panelSource).toMatch(/Операция необратима/);
    expect(panelSource).toMatch(/Подтвердить необратимое объединение/);
    expect(panelSource).toMatch(/confirmMerge/);
    expect(panelSource).not.toMatch(/window\.confirm/);
  });

  it('uses shadcn Select, not native select', () => {
    expect(panelSource).toMatch(/\bSelectTrigger\b/);
    expect(panelSource).toMatch(/\bSelectItem\b/);
    expect(panelSource).not.toMatch(/<select[\s>]/);
  });

  it('uses Link + buttonVariants, not Button asChild', () => {
    expect(panelSource).toMatch(/buttonVariants/);
    expect(panelSource).not.toMatch(/Button[\s\S]*asChild[\s\S]*Link/);
  });
});
