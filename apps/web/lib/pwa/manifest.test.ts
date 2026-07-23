import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { PWA_ICON_PATHS, isValidPwaManifest, pwaManifest } from './manifest';

const webRoot = path.join(__dirname, '../..');

describe('PWA manifest (bd-6b7.1)', () => {
  it('exposes required installable fields', () => {
    expect(pwaManifest.name).toBe('Книжная вселенная');
    expect(pwaManifest.short_name).toBe('Книжная');
    expect(pwaManifest.start_url).toBe('/');
    expect(pwaManifest.display).toBe('standalone');
    expect(pwaManifest.theme_color).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(pwaManifest.background_color).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(pwaManifest.lang).toBe('ru');
  });

  it('lists PNG icons at 192 and 512', () => {
    const sizes = pwaManifest.icons.map((icon) => icon.sizes);
    expect(sizes).toContain('192x192');
    expect(sizes).toContain('512x512');
    for (const icon of pwaManifest.icons) {
      expect(icon.type).toBe('image/png');
      expect(icon.src).toMatch(/^\/icons\/.+\.png$/);
    }
  });

  it('passes validator', () => {
    expect(isValidPwaManifest(pwaManifest)).toBe(true);
  });

  it('rejects incomplete manifests', () => {
    expect(
      isValidPwaManifest({
        ...pwaManifest,
        name: '',
      }),
    ).toBe(false);
    expect(
      isValidPwaManifest({
        ...pwaManifest,
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        ],
      }),
    ).toBe(false);
  });

  it('ships icon files on disk for 192 and 512', () => {
    for (const rel of PWA_ICON_PATHS) {
      const abs = path.join(webRoot, 'public', rel.replace(/^\//, ''));
      expect(existsSync(abs), `missing ${rel}`).toBe(true);
    }
  });
});
