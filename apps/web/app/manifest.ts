import type { MetadataRoute } from 'next';
import { pwaManifest } from '../lib/pwa/manifest';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: pwaManifest.name,
    short_name: pwaManifest.short_name,
    description: pwaManifest.description,
    start_url: pwaManifest.start_url,
    display: pwaManifest.display,
    background_color: pwaManifest.background_color,
    theme_color: pwaManifest.theme_color,
    lang: pwaManifest.lang,
    icons: pwaManifest.icons.map((icon) => ({
      src: icon.src,
      sizes: icon.sizes,
      type: icon.type,
      ...(icon.purpose ? { purpose: icon.purpose } : {}),
    })),
  };
}
