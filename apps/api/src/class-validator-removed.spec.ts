import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const apiRoot = join(__dirname, '..');
const repoRoot = join(apiRoot, '../..');
const forbiddenPackages = ['class-validator', 'class-transformer'] as const;
const sourceExtensions = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
]);
const skipDirNames = new Set([
  'node_modules',
  'dist',
  'coverage',
  '.next',
  '.git',
  'test-results',
  'playwright-report',
]);

function collectSourceFiles(
  dir: string,
  options: { includeTests?: boolean } = {},
): string[] {
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
      files.push(...collectSourceFiles(fullPath, options));
      continue;
    }
    const ext = entry.name.slice(entry.name.lastIndexOf('.'));
    if (!sourceExtensions.has(ext)) {
      continue;
    }
    if (
      !options.includeTests &&
      (entry.name.endsWith('.spec.ts') || entry.name.endsWith('.test.ts'))
    ) {
      continue;
    }
    files.push(fullPath);
  }

  return files;
}

function packageJsonDeps(packageJsonPath: string): Record<string, string> {
  const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    optionalDependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
  };

  return {
    ...(pkg.dependencies ?? {}),
    ...(pkg.devDependencies ?? {}),
    ...(pkg.optionalDependencies ?? {}),
    ...(pkg.peerDependencies ?? {}),
  };
}

describe('class-validator finalization (bd-0t0.11)', () => {
  it('does not list class-validator or class-transformer in apps/api package.json', () => {
    const deps = packageJsonDeps(join(apiRoot, 'package.json'));

    for (const name of forbiddenPackages) {
      expect(deps[name]).toBeUndefined();
    }
  });

  it('does not list class-validator or class-transformer in workspace package.json files', () => {
    const packageJsonPaths = [
      join(repoRoot, 'package.json'),
      join(repoRoot, 'apps/api/package.json'),
      join(repoRoot, 'apps/web/package.json'),
      join(repoRoot, 'packages/schemas/package.json'),
    ];

    for (const path of packageJsonPaths) {
      const deps = packageJsonDeps(path);
      for (const name of forbiddenPackages) {
        expect({ path, name, version: deps[name] }).toEqual({
          path,
          name,
          version: undefined,
        });
      }
    }
  });

  it('has no app/package source imports of class-validator or class-transformer', () => {
    const roots = [
      join(repoRoot, 'apps/api/src'),
      join(repoRoot, 'apps/api/test'),
      join(repoRoot, 'apps/web'),
      join(repoRoot, 'packages/schemas/src'),
    ];

    const importPattern =
      /from\s+['"]class-(?:validator|transformer)['"]|require\(\s*['"]class-(?:validator|transformer)['"]\s*\)/;

    const offenders: string[] = [];
    for (const root of roots) {
      for (const file of collectSourceFiles(root)) {
        const source = readFileSync(file, 'utf8');
        if (importPattern.test(source)) {
          offenders.push(relative(repoRoot, file));
        }
      }
    }

    expect(offenders).toEqual([]);
  });

  it('does not use Nest ValidationPipe in api e2e harnesses', () => {
    const e2eDir = join(apiRoot, 'test');
    const offenders: string[] = [];

    for (const file of collectSourceFiles(e2eDir, { includeTests: true })) {
      if (!file.endsWith('.e2e-spec.ts')) {
        continue;
      }
      const source = readFileSync(file, 'utf8');
      if (
        source.includes('ValidationPipe') ||
        source.includes('class-validator') ||
        source.includes('class-transformer')
      ) {
        offenders.push(relative(repoRoot, file));
      }
    }

    expect(offenders).toEqual([]);
  });

  it('bootstrap has no class-validator legacy error path helpers', () => {
    const bootstrap = readFileSync(join(__dirname, 'bootstrap.ts'), 'utf8');
    expect(bootstrap).not.toMatch(/pathFromClassValidatorMessage/);
    expect(bootstrap).not.toMatch(/class-validator/);
    expect(bootstrap).not.toMatch(/class-transformer/);
    expect(bootstrap).toMatch(/ZodValidationPipe/);
  });
});
