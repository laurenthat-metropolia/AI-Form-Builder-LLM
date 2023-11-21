/*
  Warnings:

  - A unique constraint covering the columns `[fileId,event]` on the table `ImageEvent` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ImageEvent_fileId_event_key" ON "ImageEvent"("fileId", "event");
