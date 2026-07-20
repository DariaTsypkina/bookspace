-- CreateEnum
CREATE TYPE "WorkStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'MERGED');

-- CreateEnum
CREATE TYPE "CatalogEntityStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "Work" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleRu" TEXT NOT NULL,
    "titleOrig" TEXT,
    "status" "WorkStatus" NOT NULL DEFAULT 'DRAFT',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Work_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Author" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameRu" TEXT NOT NULL,
    "nameOrig" TEXT,
    "status" "CatalogEntityStatus" NOT NULL DEFAULT 'DRAFT',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Author_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Series" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameRu" TEXT NOT NULL,
    "nameOrig" TEXT,
    "status" "CatalogEntityStatus" NOT NULL DEFAULT 'DRAFT',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameRu" TEXT NOT NULL,
    "nameOrig" TEXT,
    "status" "CatalogEntityStatus" NOT NULL DEFAULT 'DRAFT',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "World" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameRu" TEXT NOT NULL,
    "nameOrig" TEXT,
    "status" "CatalogEntityStatus" NOT NULL DEFAULT 'DRAFT',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "World_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Place" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameRu" TEXT NOT NULL,
    "nameOrig" TEXT,
    "status" "CatalogEntityStatus" NOT NULL DEFAULT 'DRAFT',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Place_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Work_slug_key" ON "Work"("slug");

-- CreateIndex
CREATE INDEX "Work_status_deletedAt_idx" ON "Work"("status", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Author_slug_key" ON "Author"("slug");

-- CreateIndex
CREATE INDEX "Author_status_deletedAt_idx" ON "Author"("status", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Series_slug_key" ON "Series"("slug");

-- CreateIndex
CREATE INDEX "Series_status_deletedAt_idx" ON "Series"("status", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Character_slug_key" ON "Character"("slug");

-- CreateIndex
CREATE INDEX "Character_status_deletedAt_idx" ON "Character"("status", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "World_slug_key" ON "World"("slug");

-- CreateIndex
CREATE INDEX "World_status_deletedAt_idx" ON "World"("status", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Place_slug_key" ON "Place"("slug");

-- CreateIndex
CREATE INDEX "Place_status_deletedAt_idx" ON "Place"("status", "deletedAt");

-- FTS: Work
ALTER TABLE "Work" ADD COLUMN "search_vector" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('russian', coalesce("titleRu", '')), 'A') ||
    setweight(to_tsvector('simple', coalesce("titleOrig", '')), 'B')
  ) STORED;
CREATE INDEX "Work_search_vector_idx" ON "Work" USING GIN ("search_vector");

-- FTS: Author
ALTER TABLE "Author" ADD COLUMN "search_vector" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('russian', coalesce("nameRu", '')), 'A') ||
    setweight(to_tsvector('simple', coalesce("nameOrig", '')), 'B')
  ) STORED;
CREATE INDEX "Author_search_vector_idx" ON "Author" USING GIN ("search_vector");

-- FTS: Series
ALTER TABLE "Series" ADD COLUMN "search_vector" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('russian', coalesce("nameRu", '')), 'A') ||
    setweight(to_tsvector('simple', coalesce("nameOrig", '')), 'B')
  ) STORED;
CREATE INDEX "Series_search_vector_idx" ON "Series" USING GIN ("search_vector");

-- FTS: Character
ALTER TABLE "Character" ADD COLUMN "search_vector" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('russian', coalesce("nameRu", '')), 'A') ||
    setweight(to_tsvector('simple', coalesce("nameOrig", '')), 'B')
  ) STORED;
CREATE INDEX "Character_search_vector_idx" ON "Character" USING GIN ("search_vector");

-- FTS: World
ALTER TABLE "World" ADD COLUMN "search_vector" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('russian', coalesce("nameRu", '')), 'A') ||
    setweight(to_tsvector('simple', coalesce("nameOrig", '')), 'B')
  ) STORED;
CREATE INDEX "World_search_vector_idx" ON "World" USING GIN ("search_vector");

-- FTS: Place
ALTER TABLE "Place" ADD COLUMN "search_vector" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('russian', coalesce("nameRu", '')), 'A') ||
    setweight(to_tsvector('simple', coalesce("nameOrig", '')), 'B')
  ) STORED;
CREATE INDEX "Place_search_vector_idx" ON "Place" USING GIN ("search_vector");
