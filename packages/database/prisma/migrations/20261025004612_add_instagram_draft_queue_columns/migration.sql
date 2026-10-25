-- AlterTable
ALTER TABLE "InstagramDraft" ADD COLUMN     "attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastError" TEXT,
ADD COLUMN     "processingStartedAt" TIMESTAMP(3),
ALTER COLUMN "status" SET DEFAULT 'QUEUED',
ALTER COLUMN "aiProviderUsed" DROP NOT NULL,
ALTER COLUMN "title" SET DEFAULT '',
ALTER COLUMN "description" SET DEFAULT '';
