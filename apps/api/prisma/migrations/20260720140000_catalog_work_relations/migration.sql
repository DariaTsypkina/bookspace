-- AlterTable
ALTER TABLE "Work" ADD COLUMN "yearFirst" INTEGER;

-- CreateTable
CREATE TABLE "Edition" (
    "id" TEXT NOT NULL,
    "workId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "title" TEXT,
    "translator" TEXT,
    "publisher" TEXT,
    "year" INTEGER,
    "isbn13" TEXT,
    "isbn10" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Edition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkAuthor" (
    "workId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "role" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "WorkAuthor_pkey" PRIMARY KEY ("workId","authorId")
);

-- CreateTable
CREATE TABLE "WorkSeries" (
    "workId" TEXT NOT NULL,
    "seriesId" TEXT NOT NULL,
    "positionInSeries" INTEGER,

    CONSTRAINT "WorkSeries_pkey" PRIMARY KEY ("workId","seriesId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Edition_isbn13_key" ON "Edition"("isbn13");

-- CreateIndex
CREATE INDEX "Edition_workId_idx" ON "Edition"("workId");

-- CreateIndex
CREATE INDEX "WorkAuthor_authorId_idx" ON "WorkAuthor"("authorId");

-- CreateIndex
CREATE INDEX "WorkSeries_seriesId_idx" ON "WorkSeries"("seriesId");

-- AddForeignKey
ALTER TABLE "Edition" ADD CONSTRAINT "Edition_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkAuthor" ADD CONSTRAINT "WorkAuthor_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkAuthor" ADD CONSTRAINT "WorkAuthor_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkSeries" ADD CONSTRAINT "WorkSeries_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkSeries" ADD CONSTRAINT "WorkSeries_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE CASCADE ON UPDATE CASCADE;
