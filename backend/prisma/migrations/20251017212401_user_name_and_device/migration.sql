/*
  Warnings:

  - A unique constraint covering the columns `[deviceId]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'DEVICE');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "deviceId" INTEGER,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'DEVICE';

-- CreateTable
CREATE TABLE "Device" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "scentSlots" JSONB NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_deviceId_key" ON "user"("deviceId");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE SET NULL ON UPDATE CASCADE;
