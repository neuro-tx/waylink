import { customType, pgEnum, timestamp } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("user_role", ["user", "provider", "admin"]);

export const providerStatusEnum = pgEnum("provider_status", [
  "pending",
  "approved",
  "suspended",
  "inactive",
]);

export const providerTypeEnum = pgEnum("provider_type", [
  "transport",
  "accommodation",
  "experience",
]);

export const memberRoleEnum = pgEnum("member_role", [
  "owner",
  "manager",
  "staff",
]);

export const planTierEnum = pgEnum("plan_tier", [
  "free",
  "pro",
  "business",
  "enterprise",
]);

export const planBillingCycleEnum = pgEnum("plan_billing_cycle", [
  "monthly",
  "yearly",
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "cancelled",
  "expired",
  "trialing",
]);

export const productStatusEnum = pgEnum("product_status", [
  "draft",
  "active", 
  "paused", 
  "archived",  
]);

export const experienceTypeEnum = pgEnum("experience_type", [
  "tour",           // City tours, walking tours, sightseeing
  "adventure",      // Hiking, diving, paragliding, zip-lining
  "cultural",       // Museums, cooking classes, workshops, traditions
  "entertainment",  // Shows, concerts, theater, nightlife
  "food_drink",     // Food tours, wine tasting, culinary experiences
  "sports",         // Sports activities, games, fitness
  "wellness",       // Spa, yoga, meditation, wellness retreats
  "water",          // Snorkeling, boat tours, fishing, surfing
  "wildlife",       // Safari, bird watching, animal encounters
  "photography",    // Photo tours, photo workshops
  "nature",         // National parks, hikes, eco-trips
  "shopping",       // Local markets, shopping tours
  "nightlife",      // Clubs, bars, night events
  "learning",       // Classes, workshops, educational experiences
  "seasonal",       // Festivals, seasonal events, holidays
]);

export const difficultyLevelEnum = pgEnum("difficulty_level", [
  "easy",
  "moderate",
  "challenging",
  "extreme",
]);

export const transportTypeEnum = pgEnum("transport_type", [
  "bus",           // Long-distance buses, coaches
  "flight",        // Airplanes
  "train",         // Railways
  "ferry",         // Boats, ferries
  "cruise",        // Multi-day cruise ships
  "car_rental",    // Rental cars
  "shuttle",       // Airport/hotel shuttles
  "taxi",          // Private taxis, ride-hailing
  "private_van",   // Group transport, minibuses
  "helicopter",    // Helicopter tours
]);

export const transportClassEnum = pgEnum("transport_class", [
  "economy",
  "business",
  "first_class",
  "premium_economy",
  "vip",
]);

export const seatTypeEnum = pgEnum("seat_type", [
  "standard",       // Regular seat
  "reclining",      // Reclining seat
  "semi_sleeper",   // Partial bed (bus)
  "sleeper",        // Full bed (bus/train)
  "bed",            // Cruise or hostel bed
  "cabin",          // Private cabin (cruise/train)
  "premium",        // Extra legroom
  "vip",            // VIP / luxury seating
  "window",         // Window preference
  "aisle",          // Aisle preference
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "booking_confirmed",
  "booking_cancelled",
  "booking_completed",
  "review_received",
  "provider_approved",
  "provider_rejected",
  "provider_suspended",
  "system_announcement",
  "system_warning",
  "promotion",
]);

export const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

export const timestamps = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
};