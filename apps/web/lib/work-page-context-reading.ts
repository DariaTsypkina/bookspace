import type { PublicContextReadingItem } from './catalog-context-reading';

export function shouldRenderWorkContextReadingSection(
  items: PublicContextReadingItem[],
): boolean {
  return items.length > 0;
}
