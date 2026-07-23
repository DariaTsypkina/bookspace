import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const pageSource = readFileSync(path.join(__dirname, 'page.tsx'), 'utf8');
const panelSource = readFileSync(
  path.join(__dirname, 'admin-context-panel.tsx'),
  'utf8',
);
const globalsSource = readFileSync(
  path.join(__dirname, '../../globals.css'),
  'utf8',
);

describe('Admin Context page Tailwind+shadcn migration (S13 / bd-wus.16)', () => {
  it('does not use legacy admin-context-* class names on the page or panel', () => {
    const legacyClass = /className=["'][^"']*admin-context-/;
    expect(pageSource).not.toMatch(legacyClass);
    expect(panelSource).not.toMatch(legacyClass);
    expect(panelSource).not.toMatch(/["'`]admin-context-page["'`]/);
    expect(panelSource).not.toMatch(/["'`]admin-context-header["'`]/);
    expect(panelSource).not.toMatch(/["'`]admin-context-lead["'`]/);
    expect(panelSource).not.toMatch(/["'`]admin-context-error["'`]/);
    expect(panelSource).not.toMatch(/["'`]admin-context-list["'`]/);
    expect(panelSource).not.toMatch(/["'`]admin-context-card["'`]/);
    expect(panelSource).not.toMatch(/["'`]admin-context-meta["'`]/);
    expect(panelSource).not.toMatch(/["'`]admin-context-snippet["'`]/);
    expect(panelSource).not.toMatch(/["'`]admin-context-form["'`]/);
    expect(panelSource).not.toMatch(/["'`]admin-context-actions["'`]/);
  });

  it('uses Tailwind layout utilities and theme tokens on the panel', () => {
    expect(panelSource).toMatch(/\bflex\b/);
    expect(panelSource).toMatch(/\bflex-1\b/);
    expect(panelSource).toMatch(/text-foreground/);
    expect(panelSource).toMatch(/text-muted/);
  });

  it('uses shadcn Card, Button, Input, Label on the panel', () => {
    expect(panelSource).toMatch(/from ['"]@\/components\/ui\/card['"]/);
    expect(panelSource).toMatch(/from ['"]@\/components\/ui\/button['"]/);
    expect(panelSource).toMatch(/from ['"]@\/components\/ui\/input['"]/);
    expect(panelSource).toMatch(/from ['"]@\/components\/ui\/label['"]/);
    expect(panelSource).toMatch(/\bCard\b/);
    expect(panelSource).toMatch(/\bButton\b/);
    expect(panelSource).toMatch(/\bInput\b/);
    expect(panelSource).toMatch(/\bLabel\b/);
  });

  it('keeps AdminOnly gate and admin context UX / API wiring', () => {
    expect(pageSource).toMatch(/AdminOnly/);
    expect(pageSource).toMatch(/AdminContextPanel/);
    expect(panelSource).toMatch(/ContextReading/);
    expect(panelSource).toMatch(
      /Очередь недавних auto-published записей для выборочной правки/,
    );
    expect(panelSource).toMatch(/Почему \(RU\)/);
    expect(panelSource).toMatch(/Сохранить/);
    expect(panelSource).toMatch(/Снять с публикации/);
    expect(panelSource).toMatch(/Отклонить/);
    expect(panelSource).toMatch(/Classify/);
    expect(panelSource).toMatch(/Extract/);
    expect(panelSource).toMatch(/fetchRecentContextReadings/);
    expect(panelSource).toMatch(/patchContextReading/);
    expect(panelSource).toMatch(/unpublishContextReading/);
    expect(panelSource).toMatch(/rejectContextReading/);
    expect(panelSource).toMatch(/classifyContextForWork/);
    expect(panelSource).toMatch(/extractContextForWork/);
  });

  it('removes orphan .admin-context-* rules from globals.css', () => {
    expect(globalsSource).not.toMatch(/\.admin-context-page\b/);
    expect(globalsSource).not.toMatch(/\.admin-context-header\b/);
    expect(globalsSource).not.toMatch(/\.admin-context-lead\b/);
    expect(globalsSource).not.toMatch(/\.admin-context-error\b/);
    expect(globalsSource).not.toMatch(/\.admin-context-list\b/);
    expect(globalsSource).not.toMatch(/\.admin-context-card\b/);
    expect(globalsSource).not.toMatch(/\.admin-context-meta\b/);
    expect(globalsSource).not.toMatch(/\.admin-context-snippet\b/);
    expect(globalsSource).not.toMatch(/\.admin-context-form\b/);
    expect(globalsSource).not.toMatch(/\.admin-context-actions\b/);
  });
});
