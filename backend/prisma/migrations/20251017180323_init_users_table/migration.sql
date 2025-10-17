/*
  Warnings:

  - The primary key for the `colognes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `brand_name` on the `colognes` table. All the data in the column will be lost.
  - The `id` column on the `colognes` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `orders` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `device_id` on the `orders` table. All the data in the column will be lost.
  - The `id` column on the `orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `scent_id` on the `orders` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "public"."orders" DROP CONSTRAINT "orders_scent_id_fkey";

-- AlterTable
ALTER TABLE "colognes" DROP CONSTRAINT "colognes_pkey",
DROP COLUMN "brand_name",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "colognes_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "orders" DROP CONSTRAINT "orders_pkey",
DROP COLUMN "device_id",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "scent_id",
ADD COLUMN     "scent_id" INTEGER NOT NULL,
ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "user_name" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_user_name_key" ON "user"("user_name");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_scent_id_fkey" FOREIGN KEY ("scent_id") REFERENCES "colognes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
