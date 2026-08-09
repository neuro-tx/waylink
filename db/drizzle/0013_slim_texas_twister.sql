ALTER TABLE "bookings_financial" RENAME COLUMN "commission" TO "commission_rate";--> statement-breakpoint
ALTER TABLE "bookings_financial" DROP CONSTRAINT "bookings_financial_plan_id_plans_id_fk";
--> statement-breakpoint
ALTER TABLE "bookings_financial" ALTER COLUMN "plan_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings_financial" ADD CONSTRAINT "bookings_financial_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "active_user_booking_idx" ON "bookings" USING btree ("user_id","variant_id") WHERE "bookings"."status" IN ('pending', 'confirmed');--> statement-breakpoint
ALTER TABLE "bookings_financial" DROP COLUMN "booking_status";--> statement-breakpoint
ALTER TABLE "bookings_financial" DROP COLUMN "net_amount";