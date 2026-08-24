-- CreateEnum
CREATE TYPE "HeroMode" AS ENUM ('VIDEO', 'SLIDER');

-- AlterTable
ALTER TABLE "HomepageContent" ADD COLUMN     "heroMode" "HeroMode" NOT NULL DEFAULT 'SLIDER';
