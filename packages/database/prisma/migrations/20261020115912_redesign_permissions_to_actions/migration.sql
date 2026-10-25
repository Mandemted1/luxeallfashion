/*
  Warnings:

  - You are about to drop the column `level` on the `AdminInvitePermission` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `AdminPermission` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AdminAction" AS ENUM ('ORDERS_UPDATE_STATUS', 'ORDERS_UNDO_STATUS', 'PRODUCTS_CREATE', 'PRODUCTS_EDIT', 'PRODUCTS_DELETE', 'PRODUCTS_TOGGLE_ACTIVE', 'PRODUCTS_MANAGE_VARIANTS', 'PRODUCTS_MANAGE_CATEGORIES', 'INSTAGRAM_DRAFTS_SYNC', 'INSTAGRAM_DRAFTS_REVIEW', 'INSTAGRAM_DRAFTS_AI_SETTINGS', 'DISCOUNT_CODES_CREATE', 'DISCOUNT_CODES_TOGGLE_ACTIVE', 'DISCOUNT_CODES_DELETE', 'HOMEPAGE_EDIT_CONTENT', 'HOMEPAGE_EDIT_TILES', 'HOMEPAGE_EDIT_PROMO_BANNER', 'HOMEPAGE_MANAGE_SOCIAL_LINKS');

-- AlterTable
ALTER TABLE "AdminInvitePermission" DROP COLUMN "level";

-- AlterTable
ALTER TABLE "AdminPermission" DROP COLUMN "level";

-- DropEnum
DROP TYPE "PermissionLevel";

-- CreateTable
CREATE TABLE "AdminActionGrant" (
    "id" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "action" "AdminAction" NOT NULL,

    CONSTRAINT "AdminActionGrant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminInviteActionGrant" (
    "id" TEXT NOT NULL,
    "inviteId" TEXT NOT NULL,
    "action" "AdminAction" NOT NULL,

    CONSTRAINT "AdminInviteActionGrant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminActionGrant_adminUserId_action_key" ON "AdminActionGrant"("adminUserId", "action");

-- CreateIndex
CREATE UNIQUE INDEX "AdminInviteActionGrant_inviteId_action_key" ON "AdminInviteActionGrant"("inviteId", "action");

-- AddForeignKey
ALTER TABLE "AdminActionGrant" ADD CONSTRAINT "AdminActionGrant_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminInviteActionGrant" ADD CONSTRAINT "AdminInviteActionGrant_inviteId_fkey" FOREIGN KEY ("inviteId") REFERENCES "AdminInvite"("id") ON DELETE CASCADE ON UPDATE CASCADE;
