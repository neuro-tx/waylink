ALTER TABLE "bookings_financial" ALTER COLUMN "platform_fee" SET DATA TYPE numeric(12, 2);--> statement-breakpoint
ALTER TABLE "bookings_financial" ALTER COLUMN "provider_fee" SET DATA TYPE numeric(12, 2);--> statement-breakpoint
ALTER TABLE "bookings_financial" ADD COLUMN "booking_status" "booking_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings_financial" ADD COLUMN "plan_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings_financial" ADD COLUMN "tier" "plan_tier" NOT NULL;--> statement-breakpoint
CREATE INDEX "financial_created_idx" ON "bookings_financial" USING btree ("created_at");