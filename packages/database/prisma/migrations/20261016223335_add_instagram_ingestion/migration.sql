-- CreateEnum
CREATE TYPE "AiProvider" AS ENUM ('GEMINI', 'OPENAI', 'ANTHROPIC');

-- CreateEnum
CREATE TYPE "InstagramDraftStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "AiIntegrationSettings" (
    "id" TEXT NOT NULL,
    "provider" "AiProvider" NOT NULL DEFAULT 'GEMINI',
    "apiKey" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiIntegrationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstagramDraft" (
    "id" TEXT NOT NULL,
    "instagramPostId" TEXT NOT NULL,
    "sourceAccount" "Brand" NOT NULL,
    "status" "InstagramDraftStatus" NOT NULL DEFAULT 'PENDING',
    "aiProviderUsed" "AiProvider" NOT NULL,
    "permalink" TEXT,
    "originalCaption" TEXT NOT NULL,
    "images" TEXT[],
    "title" TEXT NOT NULL,
    "brandName" TEXT,
    "description" TEXT NOT NULL,
    "detectedPriceGhs" INTEGER,
    "sizes" TEXT[],
    "color" TEXT,
    "missingFields" TEXT[],
    "productId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstagramDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InstagramDraft_instagramPostId_key" ON "InstagramDraft"("instagramPostId");

-- CreateIndex
CREATE UNIQUE INDEX "InstagramDraft_productId_key" ON "InstagramDraft"("productId");

-- CreateIndex
CREATE INDEX "InstagramDraft_status_idx" ON "InstagramDraft"("status");

-- CreateIndex
CREATE INDEX "InstagramDraft_sourceAccount_idx" ON "InstagramDraft"("sourceAccount");

-- AddForeignKey
ALTER TABLE "InstagramDraft" ADD CONSTRAINT "InstagramDraft_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
