CREATE TYPE "public"."business_type" AS ENUM('individual', 'company', 'agency');--> statement-breakpoint
CREATE TYPE "public"."sub_type" AS ENUM('trial', 'paid');--> statement-breakpoint
ALTER TYPE "public"."subscription_status" ADD VALUE 'paused';--> statement-breakpoint
CREATE TABLE "provider_stats" (
	"provider_id" uuid PRIMARY KEY NOT NULL,
	"total_products" integer DEFAULT 0 NOT NULL,
	"total_reviews" integer DEFAULT 0 NOT NULL,
	"avg_rating" numeric(3, 2) DEFAULT '0',
	"total_revenue" integer DEFAULT 0 NOT NULL,
	"total_bookings" integer DEFAULT 0 NOT NULL,
	"max_listings" integer,
	"remaining_listings" integer,
	"can_create_listing" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "plans" DROP CONSTRAINT "plans_slug_unique";--> statement-breakpoint
DROP INDEX "plan_tier_cycle_idx";--> statement-breakpoint
DROP INDEX "subscription_trial_idx";--> statement-breakpoint
DROP INDEX "subscription_period_idx";--> statement-breakpoint
ALTER TABLE "providers" ALTER COLUMN "business_type" SET DATA TYPE "public"."business_type" USING "business_type"::text::"public"."business_type";--> statement-breakpoint
ALTER TABLE "plans" ALTER COLUMN "price" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "status" SET DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "provider_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "is_free" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "trial_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "trial_days" integer;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "trial_ends_at" timestamp;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "start_date" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "end_date" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "type" "sub_type" DEFAULT 'paid';--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "paused_at" timestamp;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "resume_at" timestamp;--> statement-breakpoint
ALTER TABLE "provider_stats" ADD CONSTRAINT "provider_stats_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "provider_stats_products_idx" ON "provider_stats" USING btree ("total_products");--> statement-breakpoint
CREATE INDEX "provider_stats_rating_idx" ON "provider_stats" USING btree ("avg_rating");--> statement-breakpoint
CREATE UNIQUE INDEX "plan_unique_config_idx" ON "plans" USING btree ("tier","billing_cycle","max_listings");--> statement-breakpoint
CREATE INDEX "active_free_plan_idx" ON "plans" USING btree ("is_free","is_active");--> statement-breakpoint
CREATE INDEX "free_trial_plan_idx" ON "plans" USING btree ("trial_enabled");--> statement-breakpoint
CREATE INDEX "subscription_end_date_idx" ON "subscriptions" USING btree ("end_date");--> statement-breakpoint
CREATE UNIQUE INDEX "one_active_subscription_per_provider" ON "subscriptions" USING btree ("provider_id") WHERE status IN ('active', 'trialing');--> statement-breakpoint
ALTER TABLE "plans" DROP COLUMN "slug";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "current_period_start";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "current_period_end";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "trial_ends_at";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "ends_at";--> statement-breakpoint
DROP TYPE "public"."businessType";