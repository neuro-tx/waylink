CREATE TYPE "public"."booking_status" AS ENUM('pending', 'confirmed', 'cancelled', 'completed', 'expired');--> statement-breakpoint
CREATE TYPE "public"."businessType" AS ENUM('individual', 'company', 'agency');--> statement-breakpoint
CREATE TYPE "public"."recipient_type" AS ENUM('user', 'provider', 'admin');--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'provider_invite' BEFORE 'system_announcement';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'general';--> statement-breakpoint
ALTER TYPE "public"."provider_status" ADD VALUE 'rejected';--> statement-breakpoint
ALTER TABLE "provider_invites" DROP CONSTRAINT "provider_invites_invited_by_user_id_fk";
--> statement-breakpoint
ALTER TABLE "provider_invites" DROP CONSTRAINT "provider_invites_accepted_by_user_id_fk";
--> statement-breakpoint
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "providers" ALTER COLUMN "service_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."provider_type";--> statement-breakpoint
CREATE TYPE "public"."provider_type" AS ENUM('transport', 'experience');--> statement-breakpoint
ALTER TABLE "providers" ALTER COLUMN "service_type" SET DATA TYPE "public"."provider_type" USING "service_type"::"public"."provider_type";--> statement-breakpoint
DROP INDEX "provider_invite_email_idx";--> statement-breakpoint
DROP INDEX "notification_user_idx";--> statement-breakpoint
DROP INDEX "provider_invite_unique_pending_idx";--> statement-breakpoint
ALTER TABLE "providers" ALTER COLUMN "business_type" SET DATA TYPE "public"."businessType" USING "business_type"::"public"."businessType";--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."booking_status";--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "status" SET DATA TYPE "public"."booking_status" USING "status"::"public"."booking_status";--> statement-breakpoint
ALTER TABLE "provider_invites" ADD COLUMN "message" text;--> statement-breakpoint
ALTER TABLE "provider_invites" ADD COLUMN "sender_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "provider_invites" ADD COLUMN "receiver_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "provider_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "recipient_type" "recipient_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "recipient_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "provider_invites" ADD CONSTRAINT "provider_invites_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_invites" ADD CONSTRAINT "provider_invites_receiver_id_user_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "provider_invite_sender_idx" ON "provider_invites" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "provider_invite_receiver_idx" ON "provider_invites" USING btree ("receiver_id");--> statement-breakpoint
CREATE INDEX "booking_provider_id_idx" ON "bookings" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "booking_provider_stats_idx" ON "bookings" USING btree ("provider_id","status");--> statement-breakpoint
CREATE INDEX "notification_recipient_idx" ON "notifications" USING btree ("recipient_type","recipient_id");--> statement-breakpoint
CREATE UNIQUE INDEX "provider_invite_unique_pending_idx" ON "provider_invites" USING btree ("provider_id","status");--> statement-breakpoint
ALTER TABLE "provider_invites" DROP COLUMN "email";--> statement-breakpoint
ALTER TABLE "provider_invites" DROP COLUMN "invited_by";--> statement-breakpoint
ALTER TABLE "provider_invites" DROP COLUMN "accepted_by";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "user_id";