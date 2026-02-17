import {
  pgTable,
  uuid,
  text,
  index,
  timestamp,
  boolean,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./public";
import { products } from "./product";
import { notificationTypeEnum, timestamps } from "./enums";
import { bookings } from "./booking";

export const wishlists = pgTable(
  "wishlists",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull().default("My Wishlist"),
    description: text("description"),
    isPrivate: boolean("is_private").notNull().default(false),
    color: text("color").default("#e8734a"),
    ...timestamps,
  },
  (t) => [
    index("wishlist_user_idx").on(t.userId),
    uniqueIndex("wishlist_user_name_idx").on(t.userId, t.name),
  ],
);

export const wishlistItems = pgTable(
  "wishlist_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    wishlistId: uuid("wishlist_id")
      .notNull()
      .references(() => wishlists.id, { onDelete: "cascade" }),
    itemType: text("item_type")
      .$type<"experience" | "transport" | "accommodation">()
      .notNull(),
    itemId: uuid("item_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    notes: text("notes"),
    ...timestamps,
  },
  (t) => [
    index("wishlist_item_wishlist_idx").on(t.wishlistId),
    index("wishlist_item_item_idx").on(t.itemType, t.itemId),
  ],
);

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    linkUrl: text("link_url"),

    relatedBookingId: uuid("related_booking_id").references(() => bookings.id, {
      onDelete: "set null",
    }),
    relatedProductId: uuid("related_product_id").references(() => products.id, {
      onDelete: "set null",
    }),

    isRead: boolean("is_read").notNull().default(false),
    readAt: timestamp("read_at"),

    ...timestamps,
  },
  (t) => [
    index("notification_user_idx").on(t.userId),
    index("notification_type_idx").on(t.type),
    index("notification_read_idx").on(t.isRead),
    index("notification_created_idx").on(t.createdAt),
  ],
);
