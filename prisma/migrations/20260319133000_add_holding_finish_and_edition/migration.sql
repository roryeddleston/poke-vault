CREATE TYPE "HoldingFinish" AS ENUM ('NORMAL', 'HOLO', 'REVERSE', 'WPROMO');

CREATE TYPE "HoldingEdition" AS ENUM ('UNLIMITED', 'FIRST_EDITION');

ALTER TABLE "Holding"
ADD COLUMN "finish" "HoldingFinish" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN "edition" "HoldingEdition" NOT NULL DEFAULT 'UNLIMITED';

DROP INDEX "Holding_ownerId_cardId_grade_key";

CREATE UNIQUE INDEX "Holding_ownerId_cardId_grade_finish_edition_key"
ON "Holding"("ownerId", "cardId", "grade", "finish", "edition");
