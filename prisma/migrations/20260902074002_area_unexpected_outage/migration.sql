-- CreateEnum
CREATE TYPE "OutageStatus" AS ENUM ('REPORTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED');

-- CreateTable
CREATE TABLE "areas" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unexpected_outages" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "OutageStatus" NOT NULL DEFAULT 'REPORTED',
    "note" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "reporterId" TEXT NOT NULL,
    "technicianId" TEXT,
    "areaId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unexpected_outages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_area_isDeleted" ON "areas"("isDeleted");

-- CreateIndex
CREATE UNIQUE INDEX "areas_name_district_key" ON "areas"("name", "district");

-- CreateIndex
CREATE INDEX "idx_unexpected_outage_status" ON "unexpected_outages"("status");

-- CreateIndex
CREATE INDEX "idx_unexpected_outage_areaId" ON "unexpected_outages"("areaId");

-- CreateIndex
CREATE INDEX "idx_unexpected_outage_isDeleted" ON "unexpected_outages"("isDeleted");

-- AddForeignKey
ALTER TABLE "unexpected_outages" ADD CONSTRAINT "unexpected_outages_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unexpected_outages" ADD CONSTRAINT "unexpected_outages_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "technicians"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unexpected_outages" ADD CONSTRAINT "unexpected_outages_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
