-- AlterTable
ALTER TABLE "Work" ADD COLUMN "mergedIntoId" TEXT;

-- CreateIndex
CREATE INDEX "Work_mergedIntoId_idx" ON "Work"("mergedIntoId");

-- AddForeignKey
ALTER TABLE "Work" ADD CONSTRAINT "Work_mergedIntoId_fkey" FOREIGN KEY ("mergedIntoId") REFERENCES "Work"("id") ON DELETE SET NULL ON UPDATE CASCADE;
