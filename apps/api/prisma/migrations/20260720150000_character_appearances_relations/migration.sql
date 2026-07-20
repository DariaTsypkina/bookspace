-- CreateEnum
CREATE TYPE "CharacterRelationType" AS ENUM ('FRIEND', 'ENEMY', 'FAMILY', 'RELATED');

-- CreateTable
CREATE TABLE "CharacterAppearance" (
    "characterId" TEXT NOT NULL,
    "workId" TEXT NOT NULL,

    CONSTRAINT "CharacterAppearance_pkey" PRIMARY KEY ("characterId","workId")
);

-- CreateTable
CREATE TABLE "CharacterRelation" (
    "fromCharacterId" TEXT NOT NULL,
    "toCharacterId" TEXT NOT NULL,
    "type" "CharacterRelationType" NOT NULL,

    CONSTRAINT "CharacterRelation_pkey" PRIMARY KEY ("fromCharacterId","toCharacterId","type")
);

-- CreateIndex
CREATE INDEX "CharacterAppearance_workId_idx" ON "CharacterAppearance"("workId");

-- CreateIndex
CREATE INDEX "CharacterRelation_toCharacterId_idx" ON "CharacterRelation"("toCharacterId");

-- AddForeignKey
ALTER TABLE "CharacterAppearance" ADD CONSTRAINT "CharacterAppearance_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterAppearance" ADD CONSTRAINT "CharacterAppearance_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterRelation" ADD CONSTRAINT "CharacterRelation_fromCharacterId_fkey" FOREIGN KEY ("fromCharacterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterRelation" ADD CONSTRAINT "CharacterRelation_toCharacterId_fkey" FOREIGN KEY ("toCharacterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;
