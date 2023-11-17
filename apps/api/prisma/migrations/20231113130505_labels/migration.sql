/*
  Warnings:

  - Added the required column `label` to the `FormButton` table without a default value. This is not possible if the table is not empty.
  - Added the required column `label` to the `FormCheckbox` table without a default value. This is not possible if the table is not empty.
  - Added the required column `label` to the `FormToggleSwitch` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FormButton" ADD COLUMN     "label" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FormCheckbox" ADD COLUMN     "label" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FormToggleSwitch" ADD COLUMN     "label" TEXT NOT NULL;
