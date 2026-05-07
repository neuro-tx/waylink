DROP TABLE "pricing" CASCADE;--> statement-breakpoint
ALTER TABLE "product_variants" ADD COLUMN "adult_price" numeric(10, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "product_variants" ADD COLUMN "child_price" numeric(10, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "product_variants" ADD COLUMN "infant_price" numeric(10, 2) DEFAULT '0.00' NOT NULL;