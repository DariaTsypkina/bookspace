import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('admin import page', () => {
  const panelSource = readFileSync(
    join(__dirname, 'admin-import-panel.tsx'),
    'utf8',
  );
  const pageSource = readFileSync(join(__dirname, 'page.tsx'), 'utf8');

  it('is AdminOnly and uses shadcn Select', () => {
    expect(pageSource).toMatch(/AdminOnly/);
    expect(panelSource).toMatch(/\bSelectTrigger\b/);
    expect(panelSource).toMatch(/\bSelectItem\b/);
    expect(panelSource).not.toMatch(/<select\b/);
  });

  it('shows report counters and MatchQueue links', () => {
    expect(panelSource).toMatch(/Запустить/);
    expect(panelSource).toMatch(/created/);
    expect(panelSource).toMatch(/matchQueueHref/);
    expect(panelSource).toMatch(/Открыть MatchQueue/);
    expect(panelSource).toMatch(/font-sans/);
  });
});
