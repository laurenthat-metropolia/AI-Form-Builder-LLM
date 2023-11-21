-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "picture" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Form" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "Form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormSubmission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "public" BOOLEAN NOT NULL,
    "ownerId" TEXT NOT NULL,
    "formId" TEXT NOT NULL,

    CONSTRAINT "FormSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormTextfield" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,

    CONSTRAINT "FormTextfield_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormTextfieldResponse" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "textfieldId" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "FormTextfieldResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormCheckbox" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "FormCheckbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormCheckboxResponse" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "checkboxId" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "FormCheckboxResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormToggleSwitch" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "FormToggleSwitch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormToggleSwitchResponse" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "toggleSwitchId" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "FormToggleSwitchResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormImage" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "imageId" TEXT NOT NULL,

    CONSTRAINT "FormImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormButton" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "FormButton_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormLabel" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "FormLabel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "FormSubmission_formId_ownerId_key" ON "FormSubmission"("formId", "ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "FormTextfieldResponse_textfieldId_submissionId_key" ON "FormTextfieldResponse"("textfieldId", "submissionId");

-- CreateIndex
CREATE UNIQUE INDEX "FormCheckboxResponse_checkboxId_submissionId_key" ON "FormCheckboxResponse"("checkboxId", "submissionId");

-- CreateIndex
CREATE UNIQUE INDEX "FormToggleSwitchResponse_toggleSwitchId_submissionId_key" ON "FormToggleSwitchResponse"("toggleSwitchId", "submissionId");

-- AddForeignKey
ALTER TABLE "Form" ADD CONSTRAINT "Form_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormTextfield" ADD CONSTRAINT "FormTextfield_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormTextfieldResponse" ADD CONSTRAINT "FormTextfieldResponse_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "FormSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormTextfieldResponse" ADD CONSTRAINT "FormTextfieldResponse_textfieldId_fkey" FOREIGN KEY ("textfieldId") REFERENCES "FormTextfield"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormCheckbox" ADD CONSTRAINT "FormCheckbox_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormCheckboxResponse" ADD CONSTRAINT "FormCheckboxResponse_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "FormSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormCheckboxResponse" ADD CONSTRAINT "FormCheckboxResponse_checkboxId_fkey" FOREIGN KEY ("checkboxId") REFERENCES "FormCheckbox"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormToggleSwitch" ADD CONSTRAINT "FormToggleSwitch_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormToggleSwitchResponse" ADD CONSTRAINT "FormToggleSwitchResponse_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "FormSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormToggleSwitchResponse" ADD CONSTRAINT "FormToggleSwitchResponse_toggleSwitchId_fkey" FOREIGN KEY ("toggleSwitchId") REFERENCES "FormToggleSwitch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormImage" ADD CONSTRAINT "FormImage_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormButton" ADD CONSTRAINT "FormButton_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormLabel" ADD CONSTRAINT "FormLabel_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;
