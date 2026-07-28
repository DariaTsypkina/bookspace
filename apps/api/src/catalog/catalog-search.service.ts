import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { buildPrefixTsQuery } from './catalog-search-query';
import {
  CATALOG_ENTITY_PATHS,
  type CatalogSearchEntityType,
  type CatalogSearchResponse,
  type CatalogSearchResultItem,
} from './catalog-search.types';

const EMPTY_QUERY_HINTS = [
  'Введите название произведения, автора, серии или персонажа',
  'Например: «Гарри Поттер», «Толстой», «Средиземье»',
];

type RawSearchRow = {
  id: string;
  slug: string;
  title: string;
  type: CatalogSearchEntityType;
  rank: number;
};

@Injectable()
export class CatalogSearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(rawQuery: string): Promise<CatalogSearchResponse> {
    const query = rawQuery.trim();
    if (!query) {
      return { query: '', items: [], hints: EMPTY_QUERY_HINTS };
    }

    const prefixTsQuery = buildPrefixTsQuery(query);
    if (!prefixTsQuery) {
      return { query, items: [] };
    }

    const rows = await this.prisma.$queryRaw<RawSearchRow[]>(
      Prisma.sql`
        WITH search_query AS (
          SELECT
            to_tsquery('russian', ${prefixTsQuery})
            || to_tsquery('simple', ${prefixTsQuery}) AS tsq
        )
        SELECT * FROM (
          SELECT
            w.id,
            w.slug,
            w."titleRu" AS title,
            'WORK'::text AS type,
            ts_rank(w.search_vector, sq.tsq) AS rank
          FROM "Work" w
          CROSS JOIN search_query sq
          WHERE w.status = 'PUBLISHED'
            AND w."deletedAt" IS NULL
            AND w.search_vector @@ sq.tsq

          UNION ALL

          SELECT
            a.id,
            a.slug,
            a."nameRu" AS title,
            'AUTHOR'::text AS type,
            ts_rank(a.search_vector, sq.tsq) AS rank
          FROM "Author" a
          CROSS JOIN search_query sq
          WHERE a.status = 'PUBLISHED'
            AND a."deletedAt" IS NULL
            AND a.search_vector @@ sq.tsq

          UNION ALL

          SELECT
            s.id,
            s.slug,
            s."nameRu" AS title,
            'SERIES'::text AS type,
            ts_rank(s.search_vector, sq.tsq) AS rank
          FROM "Series" s
          CROSS JOIN search_query sq
          WHERE s.status = 'PUBLISHED'
            AND s."deletedAt" IS NULL
            AND s.search_vector @@ sq.tsq

          UNION ALL

          SELECT
            c.id,
            c.slug,
            c."nameRu" AS title,
            'CHARACTER'::text AS type,
            ts_rank(c.search_vector, sq.tsq) AS rank
          FROM "Character" c
          CROSS JOIN search_query sq
          WHERE c.status = 'PUBLISHED'
            AND c."deletedAt" IS NULL
            AND c.search_vector @@ sq.tsq

          UNION ALL

          SELECT
            w.id,
            w.slug,
            w."nameRu" AS title,
            'WORLD'::text AS type,
            ts_rank(w.search_vector, sq.tsq) AS rank
          FROM "World" w
          CROSS JOIN search_query sq
          WHERE w.status = 'PUBLISHED'
            AND w."deletedAt" IS NULL
            AND w.search_vector @@ sq.tsq

          UNION ALL

          SELECT
            p.id,
            p.slug,
            p."nameRu" AS title,
            'PLACE'::text AS type,
            ts_rank(p.search_vector, sq.tsq) AS rank
          FROM "Place" p
          CROSS JOIN search_query sq
          WHERE p.status = 'PUBLISHED'
            AND p."deletedAt" IS NULL
            AND p.search_vector @@ sq.tsq
        ) results
        ORDER BY rank DESC, title ASC
        LIMIT 50
      `,
    );

    const items: CatalogSearchResultItem[] = rows.map((row) => ({
      type: row.type,
      id: row.id,
      slug: row.slug,
      title: row.title,
      path: `${CATALOG_ENTITY_PATHS[row.type]}/${row.slug}`,
    }));

    return { query, items };
  }
}
