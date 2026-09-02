-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "bkashPaymentId" TEXT,
    "bkashTrxId" TEXT,
    "merchantInvoiceNumber" TEXT,
    "payerReference" TEXT,
    "paidAt" TIMESTAMP(3),
    "gatewayResponse" JSONB,
    "premiumUserId" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payments_premiumUserId_key" ON "payments"("premiumUserId");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_premiumUserId_fkey" FOREIGN KEY ("premiumUserId") REFERENCES "premium_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
