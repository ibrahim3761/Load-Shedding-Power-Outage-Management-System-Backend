-- AlterTable
ALTER TABLE "scheduled_outages" ADD COLUMN     "technicianId" TEXT;

-- AddForeignKey
ALTER TABLE "scheduled_outages" ADD CONSTRAINT "scheduled_outages_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "technicians"("id") ON DELETE SET NULL ON UPDATE CASCADE;
