/*
  Warnings:

  - You are about to drop the column `event` on the `ImageEvent` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[fileId,name]` on the table `ImageEvent` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `ImageEvent` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ImageEvent_fileId_event_key";

-- AlterTable
ALTER TABLE "ImageEvent" DROP COLUMN "event",
ADD COLUMN     "name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ImageEvent_fileId_name_key" ON "ImageEvent"("fileId", "name");
