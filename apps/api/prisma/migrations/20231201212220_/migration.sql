/*
  Warnings:

  - You are about to drop the column `name` on the `FormSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `FormSubmission` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FormSubmission" DROP COLUMN "name",
DROP COLUMN "status",
ALTER COLUMN "ownerId" DROP NOT NULL;
