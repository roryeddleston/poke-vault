CREATE TYPE "HoldingFinish_new" AS ENUM ('NORMAL', 'HOLO', 'REVERSE');

ALTER TABLE "Holding"
ALTER COLUMN "finish" DROP DEFAULT;

ALTER TABLE "Holding"
ALTER COLUMN "finish" TYPE "HoldingFinish_new"
USING (
  CASE
    WHEN "finish"::text = 'WPROMO' THEN 'NORMAL'::"HoldingFinish_new"
    ELSE "finish"::text::"HoldingFinish_new"
  END
);

DROP TYPE "HoldingFinish";

ALTER TYPE "HoldingFinish_new" RENAME TO "HoldingFinish";

ALTER TABLE "Holding"
ALTER COLUMN "finish" SET DEFAULT 'NORMAL';
