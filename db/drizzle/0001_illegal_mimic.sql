ALTER TABLE "notifications" DROP CONSTRAINT "notifications_related_booking_id_bookings_id_fk";
--> statement-breakpoint
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_related_product_id_products_id_fk";
--> statement-breakpoint
DROP INDEX "notification_type_idx";--> statement-breakpoint
CREATE INDEX "user_email_idx" ON "user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "user_role_idx" ON "user" USING btree ("role");--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "link_url";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "related_booking_id";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "related_product_id";