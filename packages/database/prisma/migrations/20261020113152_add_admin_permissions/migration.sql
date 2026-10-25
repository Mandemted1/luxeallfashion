-- CreateEnum
CREATE TYPE "AdminPage" AS ENUM ('ORDERS', 'PRODUCTS', 'INSTAGRAM_DRAFTS', 'CUSTOMERS', 'DISCOUNT_CODES', 'MARKETING', 'HOMEPAGE');

-- CreateEnum
CREATE TYPE "PermissionLevel" AS ENUM ('VIEW', 'MANAGE');

-- CreateTable
CREATE TABLE "AdminPermission" (
    "id" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "page" "AdminPage" NOT NULL,
    "level" "PermissionLevel" NOT NULL,

    CONSTRAINT "AdminPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminInvitePermission" (
    "id" TEXT NOT NULL,
    "inviteId" TEXT NOT NULL,
    "page" "AdminPage" NOT NULL,
    "level" "PermissionLevel" NOT NULL,

    CONSTRAINT "AdminInvitePermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminPermission_adminUserId_page_key" ON "AdminPermission"("adminUserId", "page");

-- CreateIndex
CREATE UNIQUE INDEX "AdminInvitePermission_inviteId_page_key" ON "AdminInvitePermission"("inviteId", "page");

-- AddForeignKey
ALTER TABLE "AdminPermission" ADD CONSTRAINT "AdminPermission_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminInvitePermission" ADD CONSTRAINT "AdminInvitePermission_inviteId_fkey" FOREIGN KEY ("inviteId") REFERENCES "AdminInvite"("id") ON DELETE CASCADE ON UPDATE CASCADE;
