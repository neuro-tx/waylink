import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  index,
  timestamp,
  numeric,
  jsonb,
} from "drizzle-orm/pg-core";
import { products, productVariants } from "./product";
import { location, timestamps } from "./shared";
import { transportTypeEnum, transportClassEnum, seatTypeEnum } from "./enums";

export const transports = pgTable(
  "transports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" })
      .unique(),

    transportType: transportTypeEnum("transport_type").notNull(),
    fromLocationId: uuid("from_location_id")
      .notNull()
      .references(() => location.id),
    toLocationId: uuid("to_location_id")
      .notNull()
      .references(() => location.id),
    distance: integer("distance"), // in kilometers
    hasDirectRoute: boolean("has_direct_route").notNull().default(true),

    transportClass: transportClassEnum("transport_class"),
    seatType: seatTypeEnum("seat_type"),
    amenities: text("amenities").array(),
    luggageAllowance: text("luggage_allowance"),
    extraLuggageFee: numeric("extra_luggage_fee", {
      precision: 10,
      scale: 2,
    }),

    importantNotes: text("important_notes").array(),
    ...timestamps,
  },
  (t) => [
    index("transport_product_idx").on(t.productId),
    index("transport_type_idx").on(t.transportType),
    index("transport_route_idx").on(t.fromLocationId, t.toLocationId),
  ],
);

export const transportSchedules = pgTable(
  "transport_schedules",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" })
      .unique(),
    departureTime: timestamp("departure_time").notNull(),
    arrivalTime: timestamp("arrival_time").notNull(),
    duration: integer("duration").notNull(),
    checkInTime: text("check_in_time"),
    stops: jsonb("stops").$type<
      {
        locationName: string;
        arrivalTime: string;
        departureTime: string;
      }[]
    >(),
    ...timestamps,
  },
  (t) => [index("transport_schedule_variant_idx").on(t.variantId)],
);
