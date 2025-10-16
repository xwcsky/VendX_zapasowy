-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_scent_id_fkey" FOREIGN KEY ("scent_id") REFERENCES "colognes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
