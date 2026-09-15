-- AlterTable
ALTER TABLE "Order" ADD COLUMN "confirmationToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Order_confirmationToken_key" ON "Order"("confirmationToken");
