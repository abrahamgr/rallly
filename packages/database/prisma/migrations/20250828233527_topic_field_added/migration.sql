-- AlterTable
ALTER TABLE "polls" ADD COLUMN     "topics" TEXT[] DEFAULT ARRAY[]::TEXT[];
