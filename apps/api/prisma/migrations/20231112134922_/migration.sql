/*
  Warnings:

  - You are about to drop the column `name` on the `ImageEvent` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[fileId,event]` on the table `ImageEvent` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `event` to the `ImageEvent` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ImageEvent_fileId_name_key";

-- AlterTable
ALTER TABLE "ImageEvent" DROP COLUMN "name",
ADD COLUMN     "event" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ImageEvent_fileId_event_key" ON "ImageEvent"("fileId", "event");
