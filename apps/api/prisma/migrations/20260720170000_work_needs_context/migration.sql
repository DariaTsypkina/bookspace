-- CreateEnum
CREATE TYPE "NeedsContext" AS ENUM ('UNKNOWN', 'YES', 'NO');

-- AlterTable
ALTER TABLE "Work" ADD COLUMN "needsContext" "NeedsContext" NOT NULL DEFAULT 'UNKNOWN';
ALTER TABLE "Work" ADD COLUMN "needsContextAdminSetAt" TIMESTAMP(3);
