/**
 * Stable ordered reading steps for series / work payloads (bd-azl.3).
 * Flat list only — no graph walk, so cycles cannot loop the UI.
 */

export interface CatalogReadingOrderStep {
  step: number;
  slug: string;
  titleRu: string;
}

export interface ReadingOrderCandidate {
  slug: string;
  titleRu: string;
  /** Explicit order signal (positionInSeries or WorkRelation.readingOrder). */
  order: number;
}

/**
 * Sort by order ASC, then titleRu (ru), then slug; assign sequential step 1..n.
 * Duplicate slugs collapse (last write wins before sort) — cycle-safe.
 */
export function buildReadingOrderSteps(
  candidates: ReadingOrderCandidate[],
): CatalogReadingOrderStep[] {
  const bySlug = new Map<string, ReadingOrderCandidate>();
  for (const candidate of candidates) {
    bySlug.set(candidate.slug, candidate);
  }

  return [...bySlug.values()]
    .sort((left, right) => {
      if (left.order !== right.order) {
        return left.order - right.order;
      }
      const byTitle = left.titleRu.localeCompare(right.titleRu, 'ru');
      if (byTitle !== 0) {
        return byTitle;
      }
      return left.slug.localeCompare(right.slug, 'en');
    })
    .map((item, index) => ({
      step: index + 1,
      slug: item.slug,
      titleRu: item.titleRu,
    }));
}
