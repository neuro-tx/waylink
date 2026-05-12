CREATE TABLE "setup_progress" (
	"product_id" uuid PRIMARY KEY NOT NULL,
	"main_info" boolean DEFAULT false NOT NULL,
	"has_media" boolean DEFAULT false NOT NULL,
	"has_variants" boolean DEFAULT false NOT NULL,
	"has_metadata" boolean DEFAULT false NOT NULL,
	"has_score" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "setup_progress" ADD CONSTRAINT "setup_progress_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;