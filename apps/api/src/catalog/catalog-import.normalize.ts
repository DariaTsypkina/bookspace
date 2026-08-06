import type { AdminCatalogImportStart } from '@bookspace/schemas';
import type {
  CatalogImportExternalId,
  NormalizedImportRow,
} from './catalog-import.types';

/** Digits-only ISBN; ISBN-10 → ISBN-13 when possible. */
export function normalizeIsbn(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 13 && /^\d{13}$/.test(digits)) {
    return digits;
  }
  if (digits.length === 10) {
    const body = digits.slice(0, 9);
    if (!/^\d{9}$/.test(body)) {
      return null;
    }
    const isbn13Body = `978${body}`;
    let sum = 0;
    for (let i = 0; i < 12; i += 1) {
      const n = Number(isbn13Body[i]);
      sum += i % 2 === 0 ? n : n * 3;
    }
    const check = (10 - (sum % 10)) % 10;
    return `${isbn13Body}${check}`;
  }
  return null;
}

export function titleNorm(title: string): string {
  return title
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function stubExternalKey(source: string, query: string): string {
  const slug = titleNorm(query).replace(/\s+/g, '-') || 'query';
  return `stub:${source}:${slug}`.slice(0, 256);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function parseExternalIds(raw: unknown): CatalogImportExternalId[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const out: CatalogImportExternalId[] = [];
  for (const item of raw) {
    const rec = asRecord(item);
    if (!rec) continue;
    const source =
      typeof rec.source === 'string' ? rec.source.trim() : undefined;
    const externalKey =
      typeof rec.externalKey === 'string'
        ? rec.externalKey.trim()
        : typeof rec.key === 'string'
          ? rec.key.trim()
          : undefined;
    if (source && externalKey) {
      out.push({ source, externalKey });
    }
  }
  return out;
}

function rowFromJson(raw: unknown, index: number): NormalizedImportRow {
  const rec = asRecord(raw) ?? {};
  const titleRu =
    (typeof rec.titleRu === 'string' && rec.titleRu.trim()) ||
    (typeof rec.title === 'string' && rec.title.trim()) ||
    `Строка ${index + 1}`;
  const titleOrig =
    typeof rec.titleOrig === 'string' && rec.titleOrig.trim()
      ? rec.titleOrig.trim()
      : undefined;
  const yearRaw = rec.yearFirst ?? rec.year;
  const yearFirst =
    typeof yearRaw === 'number' && Number.isFinite(yearRaw)
      ? Math.trunc(yearRaw)
      : typeof yearRaw === 'string' && yearRaw.trim()
        ? Number(yearRaw)
        : null;
  const isbnRaw =
    (typeof rec.isbn13 === 'string' && rec.isbn13) ||
    (typeof rec.isbn === 'string' && rec.isbn) ||
    '';
  const isbn13 = isbnRaw ? normalizeIsbn(isbnRaw) : null;
  const externalIds = parseExternalIds(rec.externalIds);
  if (isbn13 && !externalIds.some((e) => e.source === 'isbn')) {
    externalIds.push({ source: 'isbn', externalKey: isbn13 });
  }
  return {
    titleRu,
    titleOrig,
    titleNorm: titleNorm(titleRu),
    yearFirst:
      yearFirst !== null && Number.isFinite(yearFirst) ? yearFirst : null,
    isbn13,
    externalIds,
    raw,
  };
}

/** Build normalized rows from import start payload (adapters). */
export function buildImportRows(
  input: AdminCatalogImportStart,
): NormalizedImportRow[] {
  switch (input.source) {
    case 'isbn_list': {
      const isbns = input.isbns ?? [];
      return isbns.map((raw: string, index: number) => {
        const isbn13 = normalizeIsbn(raw);
        const externalIds: CatalogImportExternalId[] = isbn13
          ? [{ source: 'isbn', externalKey: isbn13 }]
          : [];
        return {
          titleRu: isbn13 ? `ISBN ${isbn13}` : `ISBN строка ${index + 1}`,
          titleNorm: titleNorm(
            isbn13 ? `ISBN ${isbn13}` : `ISBN строка ${index + 1}`,
          ),
          isbn13,
          externalIds,
          raw: { isbn: raw },
        };
      });
    }
    case 'json_upload':
      return (input.rows ?? []).map((row: unknown, index: number) =>
        rowFromJson(row, index),
      );
    case 'openlibrary': {
      const query = input.query!.trim();
      return [
        {
          titleRu: query,
          titleNorm: titleNorm(query),
          externalIds: [
            {
              source: 'openlibrary',
              externalKey: stubExternalKey('openlibrary', query),
            },
          ],
          raw: { source: 'openlibrary', query, stub: true },
        },
      ];
    }
    case 'wikidata': {
      const query = input.query!.trim();
      return [
        {
          titleRu: query,
          titleNorm: titleNorm(query),
          externalIds: [
            {
              source: 'wikidata',
              externalKey: stubExternalKey('wikidata', query),
            },
          ],
          raw: { source: 'wikidata', query, stub: true },
        },
      ];
    }
    default:
      return [];
  }
}
