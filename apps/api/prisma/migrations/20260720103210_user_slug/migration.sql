-- AlterTable
ALTER TABLE "User" ADD COLUMN "slug" TEXT;

-- Backfill existing rows (dev/test leftovers)
UPDATE "User" SET "slug" = 'user-' || substr(replace("id", '-', ''), 1, 12) WHERE "slug" IS NULL;

-- Make required + unique
ALTER TABLE "User" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "User_slug_key" ON "User"("slug");
