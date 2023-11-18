/*
  Warnings:

  - The `payload` column on the `ImageEvent` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "ImageEvent" DROP COLUMN "payload",
ADD COLUMN     "payload" JSONB;
