/*
  Warnings:

  - Changed the type of `amount` on the `payments` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "payments" 
ALTER COLUMN "amount" TYPE DOUBLE PRECISION 
USING "amount"::DOUBLE PRECISION;
