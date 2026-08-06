import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('admin match-queue page', () => {
  const panelSource = readFileSync(
    join(__dirname, 'admin-match-queue-panel.tsx'),
    'utf8',
  );
  const pageSource = readFileSync(join(__dirname, 'page.tsx'), 'utf8');

  it('is AdminOnly and uses shadcn Select', () => {
    expect(pageSource).toMatch(/AdminOnly/);
    expect(panelSource).toMatch(/\bSelectTrigger\b/);
    expect(panelSource).toMatch(/\bSelectItem\b/);
    expect(panelSource).not.toMatch(/<select\b/);
  });

  it('exposes resolve, draft and dismiss actions', () => {
    expect(panelSource).toMatch(/Очередь не сматченного/);
    expect(panelSource).toMatch(/resolveAdminMatchQueueItem/);
    expect(panelSource).toMatch(/createDraftFromMatchQueueItem/);
    expect(panelSource).toMatch(/dismissAdminMatchQueueItem/);
    expect(panelSource).toMatch(/font-sans/);
  });

  it('payloadTitle coerces payload fields to string|undefined (not string|false)', () => {
    // Avoid `(typeof x === 'string' && x) || …` — TS widens to string|false and breaks .trim().
    expect(panelSource).toMatch(
      /function nonEmptyString\(value: unknown\): string \| undefined/,
    );
    expect(panelSource).toMatch(
      /nonEmptyString\(p\.titleRu\)\s*\?\?\s*nonEmptyString\(p\.title\)\s*\?\?\s*nonEmptyString\(p\.titleOrig\)/,
    );
    expect(panelSource).not.toMatch(
      /typeof p\.titleRu === 'string' && p\.titleRu\)/,
    );
  });
});
