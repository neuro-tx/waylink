import {
  pgTable,
  uuid,
  text,
  numeric,
  timestamp,
  index,
  integer,
  uniqueIndex,
  check,
} from "drizzle-orm/pg-core";
import { user } from "./public";
import { products, productVariants } from "./product";
import { timestamps } from "./enums";
import { sql } from "drizzle-orm";

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "restrict" }),

    orderNumber: text("order_number").notNull(),
    participantsCount: integer("participants_count").notNull(),
    totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
    currency: text("currency").notNull(),

    status: text("status")
      .$type<"pending" | "confirmed" | "cancelled" | "completed">()
      .notNull()
      .default("pending"),

    canceledAt: timestamp("canceled_at"),
    completedAt: timestamp("completed_at"),
    ...timestamps,
  },
  (t) => [
    index("booking_user_idx").on(t.userId),
    index("booking_product_idx").on(t.productId),
    index("booking_variant_idx").on(t.variantId),
    index("booking_status_idx").on(t.status),
    index("booking_product_status_idx").on(t.productId, t.status),
    index("booking_user_status_idx").on(t.userId, t.status),
    uniqueIndex("booking_order_number_idx").on(t.orderNumber),
  ],
);

export const bookingItems = pgTable(
  "booking_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bookingId: uuid("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    passengerType: text("passenger_type")
      .$type<"adult" | "child" | "infant">()
      .notNull(),
    quantity: integer("quantity").notNull(),

    unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
    totalPrice: numeric("total_price", { precision: 12, scale: 2 }).notNull(),

    ...timestamps,
  },
  (t) => [
    index("line_item_booking_idx").on(t.bookingId),
    uniqueIndex("line_item_booking_passenger_idx").on(
      t.bookingId,
      t.passengerType,
    ),
    check("booking_item_quantity_positive", sql`${t.quantity} > 0`),
    check("booking_item_unit_price_non_negative", sql`${t.unitPrice} >= 0`),
    check(
      "booking_item_total_price_matches",
      sql`${t.totalPrice} = ${t.unitPrice} * ${t.quantity}`,
    ),
  ],
);