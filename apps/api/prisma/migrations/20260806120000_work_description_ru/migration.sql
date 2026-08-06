-- AlterTable (idempotent: column may already exist from ad-hoc/schema drift)
ALTER TABLE "Work" ADD COLUMN IF NOT EXISTS "descriptionRu" TEXT;

-- FTS: include descriptionRu (canon database-schema.md)
DROP INDEX IF EXISTS "Work_search_vector_idx";
ALTER TABLE "Work" DROP COLUMN IF EXISTS "search_vector";
ALTER TABLE "Work" ADD COLUMN "search_vector" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('russian', coalesce("titleRu", '')), 'A') ||
    setweight(to_tsvector('simple', coalesce("titleOrig", '')), 'B') ||
    setweight(to_tsvector('russian', coalesce("descriptionRu", '')), 'C')
  ) STORED;
CREATE INDEX "Work_search_vector_idx" ON "Work" USING GIN ("search_vector");
