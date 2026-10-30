-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AdminAction" ADD VALUE 'MARKETING_EDIT_TEMPLATES';
ALTER TYPE "AdminAction" ADD VALUE 'MARKETING_SEND_CAMPAIGN';
ALTER TYPE "AdminAction" ADD VALUE 'MARKETING_SEND_EMAIL';
ALTER TYPE "AdminAction" ADD VALUE 'MARKETING_REPLY_SUPPORT';

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "unsubscribeToken" TEXT;

-- AlterTable
ALTER TABLE "NewsletterSubscriber" ADD COLUMN     "unsubscribeToken" TEXT;

-- CreateTable
CREATE TABLE "OrderEmailTemplate" (
    "id" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "subject" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "bodyText" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderEmailTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "repliedAt" TIMESTAMP(3),

    CONSTRAINT "SupportMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderEmailTemplate_status_key" ON "OrderEmailTemplate"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_unsubscribeToken_key" ON "Customer"("unsubscribeToken");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscriber_unsubscribeToken_key" ON "NewsletterSubscriber"("unsubscribeToken");
