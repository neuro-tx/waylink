import {
  pgTable,
  uuid,
  text,
  numeric,
  index,
} from "drizzle-orm/pg-core";
import { products } from "./product";
import { sql, SQL } from "drizzle-orm";
import { timestamps, tsvector } from "./enums";

export const location = pgTable(
  "locations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id").references(() => products.id, {
      onDelete: "cascade",
    }),
    city: text("city").notNull(),
    country: text("country").notNull(),
    latitude: numeric("latitude", { precision: 9, scale: 6 }).notNull(),
    longitude: numeric("longitude", { precision: 9, scale: 6 }).notNull(),
    slug: text("slug").notNull().unique(),
    address: text("address"),
    type: text("type").$type<"start" | "end">().notNull().default("start"),
    searchVectore: tsvector("search_vector").generatedAlwaysAs(
      (): SQL => sql`to_tsvector(
          'english',
          coalesce(city, '') || ' ' ||
          coalesce(country, '') || ' ' ||
          coalesce(address, '')
        )`,
    ),
    ...timestamps,
  },
  (t) => [
    index("loc_city_idx").on(t.city),
    index("loc_country_idx").on(t.country),
    index("loc_coords_idx").on(t.latitude, t.longitude),
    index("loc_product_idx").on(t.productId),
    index("loc_type_idx").on(t.type),
    index("loc_ts_vectore_idx").using("gin", t.searchVectore),
  ],
);
