-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "premium_users" (
    "id" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "premium_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_premium_user_areaId_status" ON "premium_users"("areaId", "status");

-- CreateIndex
CREATE INDEX "idx_premium_user_expiresAt" ON "premium_users"("expiresAt");

-- AddForeignKey
ALTER TABLE "premium_users" ADD CONSTRAINT "premium_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "premium_users" ADD CONSTRAINT "premium_users_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "premium_users" ADD CONSTRAINT "premium_users_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "premium_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
