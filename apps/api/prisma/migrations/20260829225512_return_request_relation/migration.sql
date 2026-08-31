-- AddForeignKey
ALTER TABLE "return_requests" ADD CONSTRAINT "return_requests_subOrderId_fkey" FOREIGN KEY ("subOrderId") REFERENCES "sub_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
