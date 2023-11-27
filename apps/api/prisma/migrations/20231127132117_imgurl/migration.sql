/*
  Warnings:

  - You are about to drop the column `imageId` on the `FormImage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FormImage" DROP COLUMN "imageId",
ADD COLUMN     "url" TEXT;
