-- AlterTable
ALTER TABLE "InstagramDraft" ADD COLUMN     "suggestedCategoryId" TEXT;

-- AddForeignKey
ALTER TABLE "InstagramDraft" ADD CONSTRAINT "InstagramDraft_suggestedCategoryId_fkey" FOREIGN KEY ("suggestedCategoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
