import {
  pgTable,
  timestamp,
  uuid,
  text,
  numeric,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const timestamps = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
};

export const location = pgTable(
  "locations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    city: text("city").notNull(),
    country: text("country").notNull(),
    latitude: numeric("latitude", { precision: 9, scale: 6 }).notNull(),
    longitude: numeric("longitude", { precision: 9, scale: 6 }).notNull(),
    slug: text("slug").notNull().unique(),
    address: text("address"),
  },
  (t) => [
    index("location_city_idx").on(t.city),
    index("location_country_idx").on(t.country),
    index("location_coords_idx").on(t.latitude, t.longitude),
    uniqueIndex("location_city_country_unique").on(t.city, t.country),
  ],
);
