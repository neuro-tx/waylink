import {
  pgTable,
  text,
  integer,
  uuid,
  numeric,
  boolean,
  index,
  uniqueIndex,
  timestamp,
} from "drizzle-orm/pg-core";
import {
  planBillingCycleEnum,
  planTierEnum,
  subscriptionStatusEnum,
  timestamps,
} from "./enums";
import { providers } from "./provider";
import { sql } from "drizzle-orm";

// Platform plans (managed by admins)
export const plans = pgTable(
  "plans",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    tier: planTierEnum("tier").notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    priorityBoost: numeric("priority_boost", {
      precision: 3,
      scale: 2,
    })
      .notNull()
      .default("1.00"),
    featuredInSearch: boolean("featured_in_search").notNull().default(false),
    badgeLabel: text("badge_label"),
    billingCycle: planBillingCycleEnum("billing_cycle").notNull(),
    commissionRate: numeric("commission_rate", {
      precision: 5,
      scale: 2,
    }).notNull(),
    maxListings: integer("max_listings"),
    description: text("description"),
    isActive: boolean("is_active").notNull().default(true),
    highlights: text("highlights").array(),
    ...timestamps,
  },
  (t) => [
    index("plan_tier_idx").on(t.tier),
    uniqueIndex("plan_tier_cycle_idx").on(t.tier, t.billingCycle),
  ],
);

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    providerId: uuid("provider_id")
      .notNull()
      .references(() => providers.id, { onDelete: "cascade" }),
    planId: uuid("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "restrict" }),
    status: subscriptionStatusEnum("status").notNull().default("trialing"),

    currentPeriodStart: timestamp("current_period_start")
      .notNull()
      .defaultNow(),
    currentPeriodEnd: timestamp("current_period_end").notNull(),
    // Auto-calculate: 14 days from now
    trialEndsAt: timestamp("trial_ends_at").default(
      sql`NOW() + INTERVAL '14 days'`,
    ),
    listingsCount: integer("listings_count").notNull().default(0),
    cancelledAt: timestamp("cancelled_at"),
    endsAt: timestamp("ends_at"),
    autoRenew: boolean("auto_renew").notNull().default(true),
    ...timestamps,
  },
  (t) => [
    index("subscription_provider_idx").on(t.providerId),
    index("subscription_plan_idx").on(t.planId),
    index("subscription_status_idx").on(t.status),
    index("subscription_trial_idx").on(t.trialEndsAt),
    index("subscription_period_idx").on(t.currentPeriodEnd),
  ],
);
