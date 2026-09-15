-- AlterTable
ALTER TABLE "HomepageContent" ADD COLUMN     "popupBody" TEXT NOT NULL DEFAULT 'Sign up to hear about new arrivals and updates.',
ADD COLUMN     "popupEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "popupHeading" TEXT NOT NULL DEFAULT 'Join the List';

-- CreateTable
CREATE TABLE "NewsletterSubscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscriber_email_key" ON "NewsletterSubscriber"("email");
