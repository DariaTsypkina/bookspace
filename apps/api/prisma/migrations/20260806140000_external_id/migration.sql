-- CreateEnum
CREATE TYPE "ExternalIdEntityType" AS ENUM ('WORK', 'AUTHOR', 'EDITION');

-- CreateTable
CREATE TABLE "ExternalId" (
    "id" TEXT NOT NULL,
    "entityType" "ExternalIdEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "externalKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalId_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExternalId_entityType_entityId_idx" ON "ExternalId"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalId_source_externalKey_key" ON "ExternalId"("source", "externalKey");
