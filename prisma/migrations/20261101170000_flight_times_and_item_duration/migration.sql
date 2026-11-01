-- AlterTable
ALTER TABLE "ProposalItem" ADD COLUMN "durationMinutes" INTEGER;

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN "arrivalMinutes" INTEGER;
ALTER TABLE "Reservation" ADD COLUMN "departureMinutes" INTEGER;
