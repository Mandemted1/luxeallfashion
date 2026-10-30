-- CreateTable
CREATE TABLE "EmailBrandSettings" (
    "id" TEXT NOT NULL,
    "accentColor" TEXT NOT NULL DEFAULT '#000000',
    "fontSize" TEXT NOT NULL DEFAULT 'medium',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailBrandSettings_pkey" PRIMARY KEY ("id")
);
