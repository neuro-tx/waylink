import {
  pgTable,
  uuid,
  text,
  numeric,
  index,
  uniqueIndex,
  timestamp,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { providers } from "./provider";
import { location, timestamps } from "./shared";
import { productStatusEnum } from "./enums";
import { user } from "./public";

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    providerId: uuid("provider_id")
      .notNull()
      .references(() => providers.id, { onDelete: "cascade" }),
    type: text("type")
      .$type<"experience" | "transport" | "accommodation">()
      .notNull(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    shortDescription: text("short_description"),
    basePrice: numeric("base_price", { precision: 10, scale: 2 }).notNull(),
    currency: text("currency").default("USD"),
    locationId: uuid("location_id").references(() => location.id, {
      onDelete: "set null",
    }),
    status: productStatusEnum("status").notNull().default("draft"),
    ...timestamps,
  },
  (t) => [
    index("product_provider_idx").on(t.providerId),
    index("product_type_idx").on(t.type),
    index("product_status_idx").on(t.status),
    index("product_location_idx").on(t.locationId),
    uniqueIndex("product_slug_provider_idx").on(t.slug, t.providerId),
  ],
);

export const productVariants = pgTable(
  "product_variants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    name: text("name"),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date"),
    capacity: integer("capacity").notNull(),
    bookedCount: integer("booked_count").notNull().default(0),
    status: text("status")
      .$type<"available" | "sold_out" | "cancelled">()
      .notNull()
      .default("available"),
    ...timestamps,
  },
  (t) => [
    index("variant_product_idx").on(t.productId),
    index("variant_date_idx").on(t.startDate),
    index("variant_status_idx").on(t.status),
  ],
);

export const productMedia = pgTable(
  "product_media",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    type: text("type").$type<"image" | "video">().notNull().default("image"),
    isCover: boolean("is_cover").notNull().default(false),
    displayOrder: integer("display_order").notNull().default(0),
    ...timestamps,
  },
  (table) => [
    index("product_media_product_idx").on(table.productId),
    index("product_media_cover_idx").on(table.productId, table.isCover),
  ],
);

export const productScores = pgTable(
  "product_scores",
  {
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" })
      .primaryKey(),
    priceScore: integer("price_score").notNull().default(0),
    popularityScore: integer("popularity_score").notNull().default(0),
    ratingScore: integer("rating_score").notNull().default(0),
    finalScore: integer("final_score").notNull().default(0),
    computedAt: timestamp("computed_at").notNull().defaultNow(),
    ...timestamps,
  },
  (t) => [index("product_score_final_idx").on(t.finalScore)],
);

export const productReviews = pgTable(
  "product_reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    isVerified: boolean("is_verified").notNull().default(false),
    providerResponse: text("provider_response"),
    respondedAt: timestamp("responded_at"),
    ...timestamps,
  },
  (t) => [
    index("review_product_idx").on(t.productId),
    index("review_user_idx").on(t.userId),
    index("review_rating_idx").on(t.rating),
    uniqueIndex("review_user_product_idx").on(t.userId, t.productId),
  ],
);

export const productStats = pgTable("product_stats", {
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" })
    .primaryKey(),
  // Bookings
  bookingsCount: integer("bookings_count").notNull().default(0),
  completedBookingsCount: integer("completed_bookings_count")
    .notNull()
    .default(0),
  cancelledBookingsCount: integer("cancelled_bookings_count")
    .notNull()
    .default(0),

  // Reviews
  reviewsCount: integer("reviews_count").notNull().default(0),
  averageRating: numeric("average_rating", { precision: 3, scale: 2 }),

  // Revenue
  totalRevenue: numeric("total_revenue", { precision: 12, scale: 2 })
    .notNull()
    .default("0.00"),

  // Last updated
  lastBookedAt: timestamp("last_booked_at"),
  lastReviewedAt: timestamp("last_reviewed_at"),

  ...timestamps,
});

export const pricing = pgTable("pricing", {
  id: uuid("id").defaultRandom().primaryKey(),

  variantId: uuid("variant_id")
    .notNull()
    .references(() => productVariants.id, { onDelete: "cascade" })
    .unique(),

  adultPrice: numeric("adult_price", { precision: 10, scale: 2 }).notNull(),
  childPrice: numeric("child_price", { precision: 10, scale: 2 }).notNull(),
  infantPrice: numeric("infant_price", { precision: 10, scale: 2 })
    .notNull()
    .default("0.00"),

  currency: text("currency").default("USD").notNull(),

  ...timestamps,
});
