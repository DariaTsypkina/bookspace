-- AlterTable
ALTER TABLE "World" ADD COLUMN "descriptionRu" TEXT;

-- AlterTable
ALTER TABLE "Place" ADD COLUMN "worldId" TEXT;

-- CreateTable
CREATE TABLE "WorkPlace" (
    "workId" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,

    CONSTRAINT "WorkPlace_pkey" PRIMARY KEY ("workId","placeId")
);

-- CreateIndex
CREATE INDEX "Place_worldId_idx" ON "Place"("worldId");

-- CreateIndex
CREATE INDEX "WorkPlace_placeId_idx" ON "WorkPlace"("placeId");

-- AddForeignKey
ALTER TABLE "Place" ADD CONSTRAINT "Place_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkPlace" ADD CONSTRAINT "WorkPlace_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkPlace" ADD CONSTRAINT "WorkPlace_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;
