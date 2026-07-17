#!/usr/bin/env node
/**
 * Build .beads/progress.json from bd list/stats.
 * Usage: node scripts/bd-progress-export.mjs
 *        pnpm run bd:progress
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outPath = path.join(root, '.beads', 'progress.json');

function bdJson(args) {
  const out = execFileSync('bd', [...args, '--json'], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });
  const trimmed = out.trim();
  if (!trimmed) return null;
  return JSON.parse(trimmed);
}

const issues = bdJson(['list', '--all', '-n', '0', '--flat']) || [];
const statsPayload = bdJson(['stats']) || {};
const summary = statsPayload.summary || statsPayload;

function parentId(issue) {
  const deps = issue.dependencies || [];
  const parent = deps.find((d) => d.type === 'parent-child');
  if (parent?.depends_on_id) return parent.depends_on_id;
  if (issue.parent) return issue.parent;
  return null;
}

const childrenByParent = new Map();
for (const issue of issues) {
  const p = parentId(issue);
  if (!p) continue;
  if (!childrenByParent.has(p)) childrenByParent.set(p, []);
  childrenByParent.get(p).push(issue);
}

const epics = issues
  .filter((i) => i.issue_type === 'epic' || i.type === 'epic')
  .map((epic) => {
    const children = (childrenByParent.get(epic.id) || []).sort((a, b) =>
      String(a.id).localeCompare(String(b.id)),
    );
    const closed = children.filter((c) => c.status === 'closed').length;
    const inProgress = children.filter(
      (c) => c.status === 'in_progress',
    ).length;
    const open = children.filter((c) => c.status === 'open').length;
    return {
      id: epic.id,
      title: epic.title,
      status: epic.status,
      priority: epic.priority,
      children_total: children.length,
      children_closed: closed,
      children_in_progress: inProgress,
      children_open: open,
      progress: children.length ? `${closed} / ${children.length}` : '0 / 0',
      percent_closed: children.length
        ? Math.round((closed / children.length) * 100)
        : 0,
      children: children.map((c) => ({
        id: c.id,
        title: c.title,
        status: c.status,
        type: c.issue_type || c.type,
        priority: c.priority,
      })),
    };
  })
  .sort((a, b) => String(a.id).localeCompare(String(b.id)));

const compactIssues = issues.map((i) => ({
  id: i.id,
  title: i.title,
  status: i.status,
  type: i.issue_type || i.type,
  priority: i.priority,
  parent: parentId(i),
  updated_at: i.updated_at,
}));

const payload = {
  generated_at: new Date().toISOString(),
  source: 'bd list --all + bd stats',
  summary: {
    total_issues: summary.total_issues ?? issues.length,
    open_issues: summary.open_issues,
    in_progress_issues: summary.in_progress_issues,
    closed_issues: summary.closed_issues,
    blocked_issues: summary.blocked_issues,
    ready_issues: summary.ready_issues,
  },
  epics,
  issues: compactIssues,
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
console.log(
  `Wrote ${outPath} (${epics.length} epics, ${issues.length} issues)`,
);
