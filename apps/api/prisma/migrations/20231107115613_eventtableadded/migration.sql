-- CreateTable
CREATE TABLE "ImageEvent" (
    "id" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "payload" TEXT NOT NULL,

    CONSTRAINT "ImageEvent_pkey" PRIMARY KEY ("id")
);
