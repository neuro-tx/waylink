CREATE TABLE "bookings_financial" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"customer_id" text NOT NULL,
	"provider_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"total_amount" numeric(12, 2) NOT NULL,
	"currency" text NOT NULL,
	"order_number" text NOT NULL,
	"plan_price" integer NOT NULL,
	"commission" numeric(5, 2) NOT NULL,
	"platform_fee" numeric(5, 2) NOT NULL,
	"provider_fee" numeric(5, 2) NOT NULL,
	"net_amount" numeric(12, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bookings_financial" ADD CONSTRAINT "bookings_financial_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings_financial" ADD CONSTRAINT "bookings_financial_customer_id_user_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings_financial" ADD CONSTRAINT "bookings_financial_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings_financial" ADD CONSTRAINT "bookings_financial_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings_financial" ADD CONSTRAINT "bookings_financial_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "financial_booking_id_idx" ON "bookings_financial" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "financial_customer_id_idx" ON "bookings_financial" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "financial_provider_id_idx" ON "bookings_financial" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "financial_product_id_idx" ON "bookings_financial" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "financial_plan_id_idx" ON "bookings_financial" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX "financial_provider_created_idx" ON "bookings_financial" USING btree ("provider_id","created_at");