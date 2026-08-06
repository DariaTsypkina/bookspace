import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const layoutSource = readFileSync(path.join(__dirname, 'layout.tsx'), 'utf8');
const globalsSource = readFileSync(path.join(__dirname, 'globals.css'), 'utf8');

describe('Root layout shell Tailwind migration (bd-wus.18)', () => {
  it('does not use legacy app-shell / app-content class names', () => {
    expect(layoutSource).not.toMatch(/className=["']app-shell["']/);
    expect(layoutSource).not.toMatch(/className=["']app-content["']/);
    expect(layoutSource).not.toMatch(/\bapp-shell\b/);
    expect(layoutSource).not.toMatch(/\bapp-content\b/);
  });

  it('styles shell with flex column Tailwind utilities', () => {
    expect(layoutSource).toMatch(/\bflex\b/);
    expect(layoutSource).toMatch(/\bmin-h-full\b/);
    expect(layoutSource).toMatch(/\bflex-1\b/);
    expect(layoutSource).toMatch(/\bflex-col\b/);
  });

  it('reserves mobile bottom padding under fixed nav; clears at md+', () => {
    expect(layoutSource).toMatch(/pb-\[4\.25rem\]/);
    expect(layoutSource).toMatch(/\bmd:pb-0\b/);
  });

  it('keeps AppNav in the root shell', () => {
    expect(layoutSource).toMatch(/from ['"]\.\.\/components\/app-nav['"]/);
    expect(layoutSource).toMatch(/<AppNav\s*\/>/);
  });

  it('wraps shell with AuthProvider (bd-957.6)', () => {
    expect(layoutSource).toMatch(/AuthProvider/);
    expect(layoutSource).toMatch(/from ['"].*auth-provider['"]/);
    expect(layoutSource).toMatch(
      /<AuthProvider>[\s\S]*<AppNav\s*\/>[\s\S]*\{children\}[\s\S]*<\/AuthProvider>/,
    );
  });

  it('removes .app-shell and .app-content rules from globals.css', () => {
    expect(globalsSource).not.toMatch(/\.app-shell\b/);
    expect(globalsSource).not.toMatch(/\.app-content\b/);
  });
});

describe('Root layout Baskerville typography (bd-23j)', () => {
  it('loads Baskerville via next/font/local with woff2 400/700 normal+italic', () => {
    expect(layoutSource).toMatch(/from\s+['"]next\/font\/local['"]/);
    expect(layoutSource).not.toMatch(/from\s+['"]next\/font\/google['"]/);
    expect(layoutSource).not.toMatch(/\bRoboto\b/);
    expect(layoutSource).toMatch(/Baskerville-Regular\.woff2/);
    expect(layoutSource).toMatch(/Baskerville-Italic\.woff2/);
    expect(layoutSource).toMatch(/Baskerville-Bold\.woff2/);
    expect(layoutSource).toMatch(/Baskerville-BoldItalic\.woff2/);
    expect(layoutSource).toMatch(/weight:\s*['"]400['"]/);
    expect(layoutSource).toMatch(/weight:\s*['"]700['"]/);
    expect(layoutSource).toMatch(/variable:\s*['"]--font-baskerville['"]/);
  });

  it('applies Baskerville font class / CSS variable on html root', () => {
    expect(layoutSource).toMatch(/<html\b[^>]*className=\{/);
    expect(layoutSource).toMatch(/baskerville\.(?:className|variable)/);
  });

  it('does not add runtime fonts.googleapis.com link tags', () => {
    expect(layoutSource).not.toMatch(/fonts\.googleapis\.com/);
    expect(layoutSource).not.toMatch(/fonts\.gstatic\.com/);
  });

  it('body uses Baskerville CSS variable, not Georgia or Roboto as primary', () => {
    expect(globalsSource).toMatch(/font-family:\s*var\(--font-baskerville\)/);
    expect(globalsSource).not.toMatch(/font-family:\s*Georgia/);
    expect(globalsSource).not.toMatch(/--font-roboto/);
  });
});
