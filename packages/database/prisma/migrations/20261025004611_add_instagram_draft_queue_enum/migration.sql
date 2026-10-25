-- AlterEnum
-- Split into its own migration — Postgres requires new enum values to be
-- committed before they can be referenced (e.g. as a column default) by
-- a later statement, even within the same migrate run.
ALTER TYPE "InstagramDraftStatus" ADD VALUE 'QUEUED';
ALTER TYPE "InstagramDraftStatus" ADD VALUE 'FAILED';
