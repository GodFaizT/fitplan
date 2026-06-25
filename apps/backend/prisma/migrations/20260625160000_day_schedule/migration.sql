-- AlterTable
ALTER TABLE "WorkoutDay" ADD COLUMN "scheduledDays" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
