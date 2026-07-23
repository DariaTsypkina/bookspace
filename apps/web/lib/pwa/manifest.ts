import { designTokens } from '../design-tokens';

export type PwaManifestIcon = {
  src: string;
  sizes: string;
  type: 'image/png';
  purpose?: 'any' | 'maskable' | 'monochrome';
};

export type PwaManifest = {
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  background_color: string;
  theme_color: string;
  lang: string;
  icons: PwaManifestIcon[];
};

/** Paths relative to site root (also under `public/`). */
export const PWA_ICON_PATHS = [
  '/icons/icon-192.png',
  '/icons/icon-512.png',
] as const;

export const pwaManifest: PwaManifest = {
  name: 'Книжная вселенная',
  short_name: 'Книжная',
  description: 'Коллекция читателя, каталог и рейтинги',
  start_url: '/',
  display: 'standalone',
  background_color: designTokens.background,
  theme_color: designTokens.background,
  lang: 'ru',
  icons: [
    {
      src: PWA_ICON_PATHS[0],
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: PWA_ICON_PATHS[1],
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any',
    },
  ],
};

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export function isValidPwaManifest(manifest: PwaManifest): boolean {
  if (!manifest.name?.trim()) return false;
  if (!manifest.short_name?.trim()) return false;
  if (!manifest.start_url?.trim()) return false;
  if (manifest.display !== 'standalone') return false;
  if (!HEX_COLOR.test(manifest.theme_color)) return false;
  if (!HEX_COLOR.test(manifest.background_color)) return false;
  if (manifest.lang !== 'ru') return false;

  const sizes = new Set(manifest.icons.map((icon) => icon.sizes));
  if (!sizes.has('192x192') || !sizes.has('512x512')) return false;

  return manifest.icons.every(
    (icon) =>
      icon.type === 'image/png' &&
      icon.src.startsWith('/icons/') &&
      icon.src.endsWith('.png'),
  );
}
