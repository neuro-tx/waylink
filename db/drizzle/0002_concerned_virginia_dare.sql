ALTER TABLE "bookings" ALTER COLUMN "currency" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "product_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "booking_product_idx" ON "bookings" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "booking_product_status_idx" ON "bookings" USING btree ("product_id","status");--> statement-breakpoint
ALTER TABLE "pricing" DROP COLUMN "currency";--> statement-breakpoint
ALTER TABLE "booking_items" DROP COLUMN "currency";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "booked_at";--> statement-breakpoint
ALTER TABLE "booking_items" ADD CONSTRAINT "booking_item_quantity_positive" CHECK ("booking_items"."quantity" > 0);--> statement-breakpoint
ALTER TABLE "booking_items" ADD CONSTRAINT "booking_item_unit_price_non_negative" CHECK ("booking_items"."unit_price" >= 0);--> statement-breakpoint
ALTER TABLE "booking_items" ADD CONSTRAINT "booking_item_total_price_matches" CHECK ("booking_items"."total_price" = "booking_items"."unit_price" * "booking_items"."quantity");