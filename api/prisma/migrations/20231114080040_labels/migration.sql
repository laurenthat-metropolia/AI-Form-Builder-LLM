/*
  Warnings:

  - Added the required column `label` to the `FormTextfield` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FormTextfield" ADD COLUMN     "label" TEXT NOT NULL;
