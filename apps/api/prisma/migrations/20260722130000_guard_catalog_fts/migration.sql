-- Idempotent FTS guard: ensure search_vector columns exist.
-- Original DDL: 20260720102509_catalog_entities_fts
-- Recovers DBs where accidental prisma migrate dropped FTS columns.

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Work' AND column_name = 'search_vector'
  ) THEN
    ALTER TABLE "Work" ADD COLUMN "search_vector" tsvector
      GENERATED ALWAYS AS (
        setweight(to_tsvector('russian', coalesce("titleRu", '')), 'A') ||
        setweight(to_tsvector('simple', coalesce("titleOrig", '')), 'B')
      ) STORED;
    CREATE INDEX "Work_search_vector_idx" ON "Work" USING GIN ("search_vector");
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Author' AND column_name = 'search_vector'
  ) THEN
    ALTER TABLE "Author" ADD COLUMN "search_vector" tsvector
      GENERATED ALWAYS AS (
        setweight(to_tsvector('russian', coalesce("nameRu", '')), 'A') ||
        setweight(to_tsvector('simple', coalesce("nameOrig", '')), 'B')
      ) STORED;
    CREATE INDEX "Author_search_vector_idx" ON "Author" USING GIN ("search_vector");
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Series' AND column_name = 'search_vector'
  ) THEN
    ALTER TABLE "Series" ADD COLUMN "search_vector" tsvector
      GENERATED ALWAYS AS (
        setweight(to_tsvector('russian', coalesce("nameRu", '')), 'A') ||
        setweight(to_tsvector('simple', coalesce("nameOrig", '')), 'B')
      ) STORED;
    CREATE INDEX "Series_search_vector_idx" ON "Series" USING GIN ("search_vector");
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Character' AND column_name = 'search_vector'
  ) THEN
    ALTER TABLE "Character" ADD COLUMN "search_vector" tsvector
      GENERATED ALWAYS AS (
        setweight(to_tsvector('russian', coalesce("nameRu", '')), 'A') ||
        setweight(to_tsvector('simple', coalesce("nameOrig", '')), 'B')
      ) STORED;
    CREATE INDEX "Character_search_vector_idx" ON "Character" USING GIN ("search_vector");
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'World' AND column_name = 'search_vector'
  ) THEN
    ALTER TABLE "World" ADD COLUMN "search_vector" tsvector
      GENERATED ALWAYS AS (
        setweight(to_tsvector('russian', coalesce("nameRu", '')), 'A') ||
        setweight(to_tsvector('simple', coalesce("nameOrig", '')), 'B')
      ) STORED;
    CREATE INDEX "World_search_vector_idx" ON "World" USING GIN ("search_vector");
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Place' AND column_name = 'search_vector'
  ) THEN
    ALTER TABLE "Place" ADD COLUMN "search_vector" tsvector
      GENERATED ALWAYS AS (
        setweight(to_tsvector('russian', coalesce("nameRu", '')), 'A') ||
        setweight(to_tsvector('simple', coalesce("nameOrig", '')), 'B')
      ) STORED;
    CREATE INDEX "Place_search_vector_idx" ON "Place" USING GIN ("search_vector");
  END IF;
END $$;
