// experiences.ts
import {
  pgTable,
  uuid,
  text,
  integer,
  index,
  boolean,
} from "drizzle-orm/pg-core";
import { products } from "./product";
import { location, timestamps } from "./shared";
import { experienceTypeEnum } from "./enums";

export const experiences = pgTable(
  "experiences",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" })
      .unique(),
    experienceType: experienceTypeEnum("experience_type").notNull(),
    durationDays: integer("duration_days").notNull(),
    durationHours: integer("duration_hours"),
    hasRoute: boolean("has_route").notNull().default(false),
    fromLocationId: uuid("from_location_id").references(() => location.id),
    toLocationId: uuid("to_location_id").references(() => location.id),
    maxParticipants: integer("max_participants").notNull(),
    included: text("included").array(),
    notIncluded: text("not_included").array(),
    requirements: text("requirements").array(),
    ageRestriction: text("age_restriction"),
    meetingPoint: text("meeting_point"),
    meetingInstructions: text("meeting_instructions"),
    ...timestamps,
  },
  (t) => [
    index("experience_product_idx").on(t.productId),
    index("experience_type_idx").on(t.experienceType),
    index("experience_route_idx").on(t.fromLocationId, t.toLocationId),
  ],
);

export const itineraries = pgTable(
  "itineraries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    experienceId: uuid("experience_id")
      .notNull()
      .references(() => experiences.id, { onDelete: "cascade" }),
    dayNumber: integer("day_number").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    activities: text("activities").array(),
    mealsIncluded: text("meals_included").array(),
    accommodationInfo: text("accommodation_info"),
    ...timestamps,
  },
  (t) => [
    index("itinerary_experience_idx").on(t.experienceId),
    index("itinerary_day_idx").on(t.experienceId, t.dayNumber),
  ],
);
