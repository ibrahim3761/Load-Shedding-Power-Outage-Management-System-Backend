-- CreateEnum
CREATE TYPE "ScheduledOutageStatus" AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "scheduled_outages" (
    "id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" "ScheduledOutageStatus" NOT NULL DEFAULT 'UPCOMING',
    "areaId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scheduled_outages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_scheduled_outage_status" ON "scheduled_outages"("status");

-- CreateIndex
CREATE INDEX "idx_scheduled_outage_areaId" ON "scheduled_outages"("areaId");

-- CreateIndex
CREATE INDEX "idx_scheduled_outage_startTime" ON "scheduled_outages"("startTime");

-- CreateIndex
CREATE INDEX "idx_scheduled_outage_isDeleted" ON "scheduled_outages"("isDeleted");

-- AddForeignKey
ALTER TABLE "scheduled_outages" ADD CONSTRAINT "scheduled_outages_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
