CREATE TYPE "public"."difficulty_level" AS ENUM('easy', 'moderate', 'challenging', 'extreme');--> statement-breakpoint
CREATE TYPE "public"."experience_type" AS ENUM('tour', 'adventure', 'cultural', 'entertainment', 'food_drink', 'sports', 'wellness', 'water', 'wildlife', 'photography', 'nature', 'shopping', 'nightlife', 'learning', 'seasonal');--> statement-breakpoint
CREATE TYPE "public"."member_role" AS ENUM('owner', 'manager', 'staff');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('booking_confirmed', 'booking_cancelled', 'booking_completed', 'review_received', 'provider_approved', 'provider_rejected', 'provider_suspended', 'system_announcement', 'system_warning', 'promotion');--> statement-breakpoint
CREATE TYPE "public"."plan_billing_cycle" AS ENUM('monthly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."plan_tier" AS ENUM('free', 'pro', 'business', 'enterprise');--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('draft', 'active', 'paused', 'archived');--> statement-breakpoint
CREATE TYPE "public"."provider_status" AS ENUM('pending', 'approved', 'suspended', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."provider_type" AS ENUM('transport', 'accommodation', 'experience');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'provider', 'admin');--> statement-breakpoint
CREATE TYPE "public"."seat_type" AS ENUM('standard', 'reclining', 'semi_sleeper', 'sleeper', 'bed', 'cabin', 'premium', 'vip', 'window', 'aisle');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'cancelled', 'expired', 'trialing');--> statement-breakpoint
CREATE TYPE "public"."transport_class" AS ENUM('economy', 'business', 'first_class', 'premium_economy', 'vip');--> statement-breakpoint
CREATE TYPE "public"."transport_type" AS ENUM('bus', 'flight', 'train', 'ferry', 'cruise', 'car_rental', 'shuttle', 'taxi', 'private_van', 'helicopter');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" "user_role" DEFAULT 'user',
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "provider_invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" uuid NOT NULL,
	"email" text NOT NULL,
	"role" "member_role" DEFAULT 'staff',
	"token" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"invited_by" text NOT NULL,
	"accepted_by" text,
	"accepted_at" timestamp,
	"expires_at" timestamp DEFAULT NOW() + INTERVAL '7 days' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "provider_invites_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "provider_members" (
	"provider_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"role" "member_role" DEFAULT 'staff',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "provider_members_provider_id_user_id_pk" PRIMARY KEY("provider_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "providers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"logo" text,
	"cover" text,
	"service_type" "provider_type" NOT NULL,
	"business_type" text NOT NULL,
	"address" text,
	"status" "provider_status" DEFAULT 'pending',
	"is_verified" boolean DEFAULT false,
	"business_phone" text,
	"business_email" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "providers_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid,
	"city" text NOT NULL,
	"country" text NOT NULL,
	"latitude" numeric(9, 6) NOT NULL,
	"longitude" numeric(9, 6) NOT NULL,
	"slug" text NOT NULL,
	"address" text,
	"type" text DEFAULT 'start' NOT NULL,
	"search_vector" "tsvector" GENERATED ALWAYS AS (to_tsvector(
          'english',
          coalesce(city, '') || ' ' ||
          coalesce(country, '') || ' ' ||
          coalesce(address, '')
        )) STORED,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "locations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"tier" "plan_tier" NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"priority_boost" numeric(3, 2) DEFAULT '1.00' NOT NULL,
	"featured_in_search" boolean DEFAULT false NOT NULL,
	"badge_label" text,
	"billing_cycle" "plan_billing_cycle" NOT NULL,
	"commission_rate" numeric(5, 2) NOT NULL,
	"max_listings" integer,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"highlights" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "plans_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"status" "subscription_status" DEFAULT 'trialing' NOT NULL,
	"current_period_start" timestamp DEFAULT now() NOT NULL,
	"current_period_end" timestamp NOT NULL,
	"trial_ends_at" timestamp DEFAULT NOW() + INTERVAL '14 days',
	"listings_count" integer DEFAULT 0 NOT NULL,
	"cancelled_at" timestamp,
	"ends_at" timestamp,
	"auto_renew" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pricing" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"variant_id" uuid NOT NULL,
	"adult_price" numeric(10, 2) NOT NULL,
	"child_price" numeric(10, 2) NOT NULL,
	"infant_price" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pricing_variant_id_unique" UNIQUE("variant_id")
);
--> statement-breakpoint
CREATE TABLE "product_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"url" text NOT NULL,
	"type" text DEFAULT 'image' NOT NULL,
	"is_cover" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"is_verified" boolean DEFAULT false NOT NULL,
	"provider_response" text,
	"responded_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_scores" (
	"product_id" uuid PRIMARY KEY NOT NULL,
	"price_score" integer DEFAULT 0 NOT NULL,
	"popularity_score" integer DEFAULT 0 NOT NULL,
	"rating_score" integer DEFAULT 0 NOT NULL,
	"final_score" integer DEFAULT 0 NOT NULL,
	"computed_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_stats" (
	"product_id" uuid PRIMARY KEY NOT NULL,
	"bookings_count" integer DEFAULT 0 NOT NULL,
	"completed_bookings_count" integer DEFAULT 0 NOT NULL,
	"cancelled_bookings_count" integer DEFAULT 0 NOT NULL,
	"reviews_count" integer DEFAULT 0 NOT NULL,
	"average_rating" numeric(3, 2),
	"total_revenue" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"last_booked_at" timestamp,
	"last_reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"name" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"capacity" integer NOT NULL,
	"booked_count" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'available' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" uuid NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"short_description" text,
	"base_price" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'USD',
	"status" "product_status" DEFAULT 'draft' NOT NULL,
	"search_vector" "tsvector" GENERATED ALWAYS AS (to_tsvector(
      'english',
      coalesce(title, '') || ' ' ||
      coalesce(description, '') || ' ' ||
      coalesce(short_description, '')
    )) STORED,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "experiences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"experience_type" "experience_type" NOT NULL,
	"difficulty_level" "difficulty_level",
	"duration_count" integer NOT NULL,
	"duration_unit" text NOT NULL,
	"included" text[],
	"not_included" text[],
	"requirements" text[],
	"age_restriction" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "experiences_product_id_unique" UNIQUE("product_id")
);
--> statement-breakpoint
CREATE TABLE "itineraries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"experience_id" uuid NOT NULL,
	"day_number" integer NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"activities" text[],
	"meals_included" text[],
	"accommodation_info" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transport_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"variant_id" uuid NOT NULL,
	"departure_time" timestamp NOT NULL,
	"arrival_time" timestamp NOT NULL,
	"duration" integer NOT NULL,
	"check_in_time" text,
	"stops" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "transport_schedules_variant_id_unique" UNIQUE("variant_id")
);
--> statement-breakpoint
CREATE TABLE "transports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"transport_type" "transport_type" NOT NULL,
	"distance" integer,
	"has_direct_route" boolean DEFAULT true NOT NULL,
	"transport_class" "transport_class",
	"seat_type" "seat_type",
	"amenities" text[],
	"luggage_allowance" text,
	"extra_luggage_fee" numeric(10, 2),
	"departure_address" text,
	"arrival_address" text,
	"important_notes" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "transports_product_id_unique" UNIQUE("product_id")
);
--> statement-breakpoint
CREATE TABLE "booking_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"passenger_type" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"total_price" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"variant_id" uuid NOT NULL,
	"order_number" text NOT NULL,
	"participants_count" integer NOT NULL,
	"total_amount" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"booked_at" timestamp DEFAULT now() NOT NULL,
	"canceled_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"link_url" text,
	"related_booking_id" uuid,
	"related_product_id" uuid,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wishlist_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wishlist_id" uuid NOT NULL,
	"item_type" text NOT NULL,
	"item_id" uuid NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wishlists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text DEFAULT 'My Wishlist' NOT NULL,
	"description" text,
	"is_private" boolean DEFAULT false NOT NULL,
	"color" text DEFAULT '#e8734a',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_invites" ADD CONSTRAINT "provider_invites_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_invites" ADD CONSTRAINT "provider_invites_invited_by_user_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_invites" ADD CONSTRAINT "provider_invites_accepted_by_user_id_fk" FOREIGN KEY ("accepted_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_members" ADD CONSTRAINT "provider_members_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_members" ADD CONSTRAINT "provider_members_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "providers" ADD CONSTRAINT "providers_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locations" ADD CONSTRAINT "locations_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricing" ADD CONSTRAINT "pricing_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_scores" ADD CONSTRAINT "product_scores_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_stats" ADD CONSTRAINT "product_stats_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "itineraries" ADD CONSTRAINT "itineraries_experience_id_experiences_id_fk" FOREIGN KEY ("experience_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transport_schedules" ADD CONSTRAINT "transport_schedules_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transports" ADD CONSTRAINT "transports_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_items" ADD CONSTRAINT "booking_items_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_related_booking_id_bookings_id_fk" FOREIGN KEY ("related_booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_related_product_id_products_id_fk" FOREIGN KEY ("related_product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_wishlist_id_wishlists_id_fk" FOREIGN KEY ("wishlist_id") REFERENCES "public"."wishlists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_item_id_products_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "provider_invite_provider_idx" ON "provider_invites" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "provider_invite_email_idx" ON "provider_invites" USING btree ("email");--> statement-breakpoint
CREATE INDEX "provider_invite_token_idx" ON "provider_invites" USING btree ("token");--> statement-breakpoint
CREATE INDEX "provider_invite_status_idx" ON "provider_invites" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "provider_invite_unique_pending_idx" ON "provider_invites" USING btree ("provider_id","email","status");--> statement-breakpoint
CREATE INDEX "provider_member_provider_idx" ON "provider_members" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "provider_member_user_provider_idx" ON "provider_members" USING btree ("user_id","provider_id");--> statement-breakpoint
CREATE INDEX "provider_name_idx" ON "providers" USING btree ("name");--> statement-breakpoint
CREATE INDEX "provider_email_idx" ON "providers" USING btree ("business_email");--> statement-breakpoint
CREATE UNIQUE INDEX "provider_owner_idx" ON "providers" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "provider_status_idx" ON "providers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "provider_type_idx" ON "providers" USING btree ("service_type");--> statement-breakpoint
CREATE UNIQUE INDEX "provider_owner_type_idx" ON "providers" USING btree ("owner_id","service_type");--> statement-breakpoint
CREATE INDEX "loc_city_idx" ON "locations" USING btree ("city");--> statement-breakpoint
CREATE INDEX "loc_country_idx" ON "locations" USING btree ("country");--> statement-breakpoint
CREATE INDEX "loc_coords_idx" ON "locations" USING btree ("latitude","longitude");--> statement-breakpoint
CREATE INDEX "loc_product_idx" ON "locations" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "loc_type_idx" ON "locations" USING btree ("type");--> statement-breakpoint
CREATE INDEX "loc_ts_vectore_idx" ON "locations" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "plan_tier_idx" ON "plans" USING btree ("tier");--> statement-breakpoint
CREATE UNIQUE INDEX "plan_tier_cycle_idx" ON "plans" USING btree ("tier","billing_cycle");--> statement-breakpoint
CREATE INDEX "subscription_provider_idx" ON "subscriptions" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "subscription_plan_idx" ON "subscriptions" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX "subscription_status_idx" ON "subscriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "subscription_trial_idx" ON "subscriptions" USING btree ("trial_ends_at");--> statement-breakpoint
CREATE INDEX "subscription_period_idx" ON "subscriptions" USING btree ("current_period_end");--> statement-breakpoint
CREATE INDEX "product_media_product_idx" ON "product_media" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_media_cover_idx" ON "product_media" USING btree ("product_id","is_cover");--> statement-breakpoint
CREATE INDEX "review_product_idx" ON "product_reviews" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "review_user_idx" ON "product_reviews" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "review_rating_idx" ON "product_reviews" USING btree ("rating");--> statement-breakpoint
CREATE UNIQUE INDEX "review_user_product_idx" ON "product_reviews" USING btree ("user_id","product_id");--> statement-breakpoint
CREATE INDEX "product_score_final_idx" ON "product_scores" USING btree ("final_score");--> statement-breakpoint
CREATE INDEX "variant_product_idx" ON "product_variants" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "variant_date_idx" ON "product_variants" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "variant_status_idx" ON "product_variants" USING btree ("status");--> statement-breakpoint
CREATE INDEX "product_provider_idx" ON "products" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "product_type_idx" ON "products" USING btree ("type");--> statement-breakpoint
CREATE INDEX "product_status_idx" ON "products" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "product_slug_provider_idx" ON "products" USING btree ("slug","provider_id");--> statement-breakpoint
CREATE INDEX "product_search_idx" ON "products" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "experience_product_idx" ON "experiences" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "experience_type_idx" ON "experiences" USING btree ("experience_type");--> statement-breakpoint
CREATE INDEX "experience_difficult_type_idx" ON "experiences" USING btree ("difficulty_level");--> statement-breakpoint
CREATE INDEX "itinerary_experience_idx" ON "itineraries" USING btree ("experience_id");--> statement-breakpoint
CREATE INDEX "itinerary_day_idx" ON "itineraries" USING btree ("experience_id","day_number");--> statement-breakpoint
CREATE INDEX "transport_schedule_variant_idx" ON "transport_schedules" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "transport_product_idx" ON "transports" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "transport_type_idx" ON "transports" USING btree ("transport_type");--> statement-breakpoint
CREATE INDEX "line_item_booking_idx" ON "booking_items" USING btree ("booking_id");--> statement-breakpoint
CREATE UNIQUE INDEX "line_item_booking_passenger_idx" ON "booking_items" USING btree ("booking_id","passenger_type");--> statement-breakpoint
CREATE INDEX "booking_user_idx" ON "bookings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "booking_variant_idx" ON "bookings" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "booking_status_idx" ON "bookings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "booking_user_status_idx" ON "bookings" USING btree ("user_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "booking_order_number_idx" ON "bookings" USING btree ("order_number");--> statement-breakpoint
CREATE INDEX "notification_user_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notification_type_idx" ON "notifications" USING btree ("type");--> statement-breakpoint
CREATE INDEX "notification_read_idx" ON "notifications" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "notification_created_idx" ON "notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "wishlist_item_wishlist_idx" ON "wishlist_items" USING btree ("wishlist_id");--> statement-breakpoint
CREATE INDEX "wishlist_item_item_idx" ON "wishlist_items" USING btree ("item_type","item_id");--> statement-breakpoint
CREATE INDEX "wishlist_user_idx" ON "wishlists" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "wishlist_user_name_idx" ON "wishlists" USING btree ("user_id","name");