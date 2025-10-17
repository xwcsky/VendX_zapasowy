/*
  Warnings:

  - The primary key for the `colognes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `orders` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `device_id` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."orders" DROP CONSTRAINT "orders_scent_id_fkey";

-- AlterTable
ALTER TABLE "colognes" DROP CONSTRAINT "colognes_pkey",
ADD COLUMN     "brand_name" TEXT NOT NULL DEFAULT 'unknown',
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "colognes_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "colognes_id_seq";

-- AlterTable
ALTER TABLE "orders" DROP CONSTRAINT "orders_pkey",
ADD COLUMN     "device_id" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "scent_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "orders_id_seq";

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_scent_id_fkey" FOREIGN KEY ("scent_id") REFERENCES "colognes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
