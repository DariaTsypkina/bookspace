-- CreateEnum
CREATE TYPE "ContextReadingStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'REJECTED');

-- CreateEnum
CREATE TYPE "MatchQueueKind" AS ENUM ('RANKING_ENTRY', 'CONTEXT_CANDIDATE', 'IMPORT_ROW');

-- CreateEnum
CREATE TYPE "MatchQueueStatus" AS ENUM ('OPEN', 'RESOLVED', 'DISMISSED');

-- CreateTable
CREATE TABLE "ContextReading" (
    "id" TEXT NOT NULL,
    "subjectWorkId" TEXT NOT NULL,
    "recommendedWorkId" TEXT NOT NULL,
    "importanceRank" INTEGER NOT NULL,
    "whyText" TEXT NOT NULL,
    "status" "ContextReadingStatus" NOT NULL DEFAULT 'DRAFT',
    "sourceUrl" TEXT,
    "sourceSnippet" TEXT,
    "llmModel" TEXT,
    "llmRunId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContextReading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchQueue" (
    "id" TEXT NOT NULL,
    "kind" "MatchQueueKind" NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "MatchQueueStatus" NOT NULL DEFAULT 'OPEN',
    "resolvedWorkId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatchQueue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContextReading_subjectWorkId_status_idx" ON "ContextReading"("subjectWorkId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ContextReading_subjectWorkId_recommendedWorkId_key" ON "ContextReading"("subjectWorkId", "recommendedWorkId");

-- CreateIndex
CREATE INDEX "MatchQueue_kind_status_idx" ON "MatchQueue"("kind", "status");

-- AddForeignKey
ALTER TABLE "ContextReading" ADD CONSTRAINT "ContextReading_subjectWorkId_fkey" FOREIGN KEY ("subjectWorkId") REFERENCES "Work"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContextReading" ADD CONSTRAINT "ContextReading_recommendedWorkId_fkey" FOREIGN KEY ("recommendedWorkId") REFERENCES "Work"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchQueue" ADD CONSTRAINT "MatchQueue_resolvedWorkId_fkey" FOREIGN KEY ("resolvedWorkId") REFERENCES "Work"("id") ON DELETE SET NULL ON UPDATE CASCADE;
