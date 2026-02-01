import {
  pgTable,
  uuid,
  text,
  numeric,
  timestamp,
  index,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { timestamps } from "./shared";
import { user } from "./public";
import { productVariants } from "./product";

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "restrict" }),

    orderNumber: text("order_number").notNull(),
    participantsCount: integer("participants_count").notNull(),
    totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
    currency: text("currency").default("USD").notNull(),

    status: text("status")
      .$type<"pending" | "confirmed" | "cancelled" | "completed">()
      .notNull()
      .default("pending"),

    bookedAt: timestamp("booked_at").notNull().defaultNow(),
    canceledAt: timestamp("canceled_at"),
    completedAt: timestamp("completed_at"),
    ...timestamps,
  },
  (t) => [
    index("booking_user_idx").on(t.userId),
    index("booking_variant_idx").on(t.variantId),
    index("booking_status_idx").on(t.status),
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
    currency: text("currency").notNull().default("USD"),

    ...timestamps,
  },
  (t) => [
    index("line_item_booking_idx").on(t.bookingId),
    uniqueIndex("line_item_booking_passenger_idx").on(
      t.bookingId,
      t.passengerType,
    ),
  ],
);
