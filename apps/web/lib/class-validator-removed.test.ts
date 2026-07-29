import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const webRoot = join(__dirname, '..');
const repoRoot = join(webRoot, '../..');
const forbiddenPackages = ['class-validator', 'class-transformer'] as const;
const skipDirNames = new Set([
  'node_modules',
  '.next',
  'dist',
  'coverage',
  'test-results',
  'playwright-report',
]);

function collectTsFiles(dir: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }

  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) {
      continue;
    }
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (skipDirNames.has(entry.name)) {
        continue;
      }
      files.push(...collectTsFiles(fullPath));
      continue;
    }
    if (!/\.(ts|tsx)$/.test(entry.name)) {
      continue;
    }
    if (/\.(test|spec)\.(ts|tsx)$/.test(entry.name)) {
      continue;
    }
    files.push(fullPath);
  }

  return files;
}

describe('class-validator finalization web (bd-0t0.11)', () => {
  it('does not depend on class-validator or class-transformer', () => {
    const pkg = JSON.parse(
      readFileSync(join(webRoot, 'package.json'), 'utf8'),
    ) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const deps = {
      ...(pkg.dependencies ?? {}),
      ...(pkg.devDependencies ?? {}),
    };

    for (const name of forbiddenPackages) {
      expect(deps[name]).toBeUndefined();
    }
  });

  it('has no source imports of class-validator or class-transformer', () => {
    const importPattern =
      /from\s+['"]class-(?:validator|transformer)['"]|require\(\s*['"]class-(?:validator|transformer)['"]\s*\)/;
    const offenders: string[] = [];

    for (const file of collectTsFiles(webRoot)) {
      const source = readFileSync(file, 'utf8');
      if (importPattern.test(source)) {
        offenders.push(relative(repoRoot, file));
      }
    }

    expect(offenders).toEqual([]);
  });

  it('keeps Zod-friendly form helper (not legacy useState validators)', () => {
    const formErrors = readFileSync(join(__dirname, 'form-errors.ts'), 'utf8');
    expect(formErrors).toMatch(/getFriendlyZodIssueMessage/);
    expect(formErrors).not.toMatch(/class-validator/);
    expect(formErrors).not.toMatch(/useState/);
  });
});
