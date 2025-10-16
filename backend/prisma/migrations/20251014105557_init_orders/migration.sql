-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "scent_id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "creation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);
