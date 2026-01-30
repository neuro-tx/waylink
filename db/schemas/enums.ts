import { pgEnum } from "drizzle-orm/pg-core";

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
  "basic",
  "professional",
  "enterprise",
]);

export const planBillingCycleEnum = pgEnum("plan_billing_cycle", [
  "monthly",
  "yearly",
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "past_due",
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
]);
