-- CreateEnum
CREATE TYPE "WorkRelationType" AS ENUM ('SEQUEL', 'PREQUEL', 'RELATED', 'ADAPTATION');

-- CreateTable
CREATE TABLE "WorkRelation" (
    "fromWorkId" TEXT NOT NULL,
    "toWorkId" TEXT NOT NULL,
    "type" "WorkRelationType" NOT NULL,
    "readingOrder" INTEGER,

    CONSTRAINT "WorkRelation_pkey" PRIMARY KEY ("fromWorkId","toWorkId","type")
);

-- CreateIndex
CREATE INDEX "WorkRelation_toWorkId_idx" ON "WorkRelation"("toWorkId");

-- AddForeignKey
ALTER TABLE "WorkRelation" ADD CONSTRAINT "WorkRelation_fromWorkId_fkey" FOREIGN KEY ("fromWorkId") REFERENCES "Work"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkRelation" ADD CONSTRAINT "WorkRelation_toWorkId_fkey" FOREIGN KEY ("toWorkId") REFERENCES "Work"("id") ON DELETE CASCADE ON UPDATE CASCADE;
