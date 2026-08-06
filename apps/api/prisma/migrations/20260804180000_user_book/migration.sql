-- CreateEnum
CREATE TYPE "UserBookStatus" AS ENUM ('WANT', 'READING', 'READ', 'ABANDONED');

-- CreateTable
CREATE TABLE "UserBook" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workId" TEXT NOT NULL,
    "editionId" TEXT,
    "status" "UserBookStatus" NOT NULL,
    "rating" INTEGER,
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserBook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserBook_userId_status_idx" ON "UserBook"("userId", "status");

-- CreateIndex
CREATE INDEX "UserBook_workId_idx" ON "UserBook"("workId");

-- CreateIndex
CREATE UNIQUE INDEX "UserBook_userId_workId_key" ON "UserBook"("userId", "workId");

-- AddForeignKey
ALTER TABLE "UserBook" ADD CONSTRAINT "UserBook_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBook" ADD CONSTRAINT "UserBook_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work"("id") ON DELETE CASCADE ON UPDATE CASCADE;
