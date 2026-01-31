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
import { products, productVariants } from "./product";
import { providers } from "./provider";

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    providerId: uuid("provider_id").references(() => providers.id, {
      onDelete: "set null",
    }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),

    orderNumber: text("order_number").notNull().unique(),
    participantsCount: integer("participants_count").notNull(),

    totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
    currency: text("currency").default("USD").notNull(),

    bookedAt: timestamp("booked_at").notNull().defaultNow(),
    canceledAt: timestamp("canceled_at"),
    completedAt: timestamp("completed_at"),

    bookingType: text("booking_type")
      .$type<"experience" | "transport" | "accommodation">()
      .notNull(),
    status: text("status")
      .$type<"pending" | "confirmed" | "cancelled" | "completed">()
      .notNull()
      .default("pending"),

    ...timestamps,
  },
  (t) => [
    index("order_user_idx").on(t.userId),
    index("order_status_idx").on(t.status),

    uniqueIndex("order_number_idx").on(t.orderNumber),
    index("booking_user_idx").on(t.userId),
    index("booking_provider_idx").on(t.providerId),
    index("booking_type_idx").on(t.bookingType),
    index("booking_status_idx").on(t.status),
  ],
);
