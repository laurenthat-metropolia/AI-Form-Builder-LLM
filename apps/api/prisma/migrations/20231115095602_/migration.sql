/*
  Warnings:

  - You are about to drop the `FormTextfield` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FormTextfieldResponse` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FormTextfield" DROP CONSTRAINT "FormTextfield_formId_fkey";

-- DropForeignKey
ALTER TABLE "FormTextfieldResponse" DROP CONSTRAINT "FormTextfieldResponse_submissionId_fkey";

-- DropForeignKey
ALTER TABLE "FormTextfieldResponse" DROP CONSTRAINT "FormTextfieldResponse_textfieldId_fkey";

-- DropTable
DROP TABLE "FormTextfield";

-- DropTable
DROP TABLE "FormTextfieldResponse";

-- CreateTable
CREATE TABLE "FormTextField" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "FormTextField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormTextFieldResponse" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "textFieldId" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "FormTextFieldResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FormTextFieldResponse_textFieldId_submissionId_key" ON "FormTextFieldResponse"("textFieldId", "submissionId");

-- AddForeignKey
ALTER TABLE "FormTextField" ADD CONSTRAINT "FormTextField_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormTextFieldResponse" ADD CONSTRAINT "FormTextFieldResponse_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "FormSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormTextFieldResponse" ADD CONSTRAINT "FormTextFieldResponse_textFieldId_fkey" FOREIGN KEY ("textFieldId") REFERENCES "FormTextField"("id") ON DELETE CASCADE ON UPDATE CASCADE;
