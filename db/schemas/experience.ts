import { pgTable, uuid, text, integer, index } from "drizzle-orm/pg-core";
import { products } from "./product";
import { difficultyLevelEnum, experienceTypeEnum, timestamps } from "./enums";

export const experiences = pgTable(
  "experiences",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" })
      .unique(),

    experienceType: experienceTypeEnum("experience_type").notNull(),
    difficultyLevel: difficultyLevelEnum("difficulty_level"),

    durationCount: integer("duration_count").notNull(),
    durationUnit: text("duration_unit")
      .$type<"hours" | "minutes" | "days">()
      .notNull(),

    included: text("included").array(),
    notIncluded: text("not_included").array(),
    requirements: text("requirements").array(),
    ageRestriction: text("age_restriction"),
    ...timestamps,
  },
  (t) => [
    index("experience_product_idx").on(t.productId),
    index("experience_type_idx").on(t.experienceType),
    index("experience_difficult_type_idx").on(t.difficultyLevel),
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
