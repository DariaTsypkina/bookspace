import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const pageSource = readFileSync(path.join(__dirname, 'page.tsx'), 'utf8');
const panelSource = readFileSync(
  path.join(__dirname, 'admin-dashboard-panel.tsx'),
  'utf8',
);
const libSource = readFileSync(
  path.join(__dirname, '../../lib/admin-dashboard.ts'),
  'utf8',
);

describe('Admin dashboard page (bd-i5b.1)', () => {
  it('gates the page with AdminOnly and mounts the panel', () => {
    expect(pageSource).toMatch(/AdminOnly/);
    expect(pageSource).toMatch(/AdminDashboardPanel/);
  });

  it('uses Tailwind + shadcn Card and Link+buttonVariants (no Button asChild)', () => {
    expect(panelSource).toMatch(/from ['"]@\/components\/ui\/card['"]/);
    expect(panelSource).toMatch(/buttonVariants/);
    expect(panelSource).toMatch(/from ['"]next\/link['"]/);
    expect(panelSource).not.toMatch(/asChild/);
    expect(panelSource).toMatch(/Админ-дашборд/);
    expect(panelSource).toMatch(/MatchQueue OPEN/);
    expect(panelSource).toMatch(/Failed jobs/);
    expect(panelSource).toMatch(/Быстрые действия/);
  });

  it('wires counters via fetchAdminDashboardSummary and quick-action hrefs', () => {
    expect(panelSource).toMatch(/fetchAdminDashboardSummary/);
    expect(panelSource).toMatch(/ADMIN_DASHBOARD_QUICK_ACTIONS/);
    expect(libSource).toMatch(/ADMIN_BFF_BASE/);
    expect(libSource).toMatch(/dashboard\/summary/);
    expect(libSource).toMatch(/\/admin\/import/);
    expect(libSource).toMatch(/\/admin\/rankings/);
    expect(libSource).toMatch(/\/admin\/context/);
  });

  it('is mobile-first with a responsive counter grid', () => {
    expect(panelSource).toMatch(/grid-cols-1/);
    expect(panelSource).toMatch(/sm:grid-cols-3/);
    expect(panelSource).toMatch(/font-sans/);
  });
});
