-- CreateTable
CREATE TABLE "HomepageContent" (
    "id" TEXT NOT NULL,
    "heroVideoUrl" TEXT NOT NULL,
    "heroCtaLabel" TEXT NOT NULL,
    "heroCtaHref" TEXT NOT NULL,
    "newsletterHeading" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomepageTile" (
    "id" TEXT NOT NULL,
    "brand" "Brand" NOT NULL,
    "title" TEXT NOT NULL,
    "ctaLabel" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,

    CONSTRAINT "HomepageTile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromoBanner" (
    "id" TEXT NOT NULL,
    "brand" "Brand" NOT NULL,
    "message" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PromoBanner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialLink" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HomepageTile_brand_key" ON "HomepageTile"("brand");

-- CreateIndex
CREATE UNIQUE INDEX "PromoBanner_brand_key" ON "PromoBanner"("brand");
