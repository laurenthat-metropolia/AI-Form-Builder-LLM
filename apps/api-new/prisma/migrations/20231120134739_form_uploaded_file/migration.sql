/*
  Warnings:

  - You are about to drop the column `available` on the `Form` table. All the data in the column will be lost.
  - You are about to drop the column `public` on the `FormSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `UploadedFile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[formId]` on the table `UploadedFile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `status` to the `Form` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `FormSubmission` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UploadedFile" DROP CONSTRAINT "UploadedFile_ownerId_fkey";

-- AlterTable
ALTER TABLE "Form" DROP COLUMN "available",
ADD COLUMN     "status" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FormSubmission" DROP COLUMN "public",
ADD COLUMN     "status" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UploadedFile" DROP COLUMN "ownerId",
ADD COLUMN     "formId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "UploadedFile_formId_key" ON "UploadedFile"("formId");

-- AddForeignKey
ALTER TABLE "UploadedFile" ADD CONSTRAINT "UploadedFile_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;
