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
  subscriptionTypeEnum,
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
    tier: planTierEnum("tier").notNull(),
    price: integer("price").notNull(),
    isFree: boolean("is_free").notNull().default(false),
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

    trialEnabled: boolean("trial_enabled").notNull().default(false),
    trialDays: integer("trial_days"),
    // Optional: If set → trial will automatically end at this timestamp :else → ended manually by the admin
    trialEndsAt: timestamp("trial_ends_at"),
    ...timestamps,
  },
  (t) => [
    index("plan_tier_idx").on(t.tier),
    uniqueIndex("plan_unique_config_idx").on(
      t.tier,
      t.billingCycle,
      t.maxListings,
    ),
    index("active_free_plan_idx").on(t.isFree, t.isActive),
    index("free_trial_plan_idx").on(t.trialEnabled),

    // enforce consistency
    sql`CHECK (
      (is_free = true AND price = 0)
      OR (is_free = false AND price > 0)
    )`,
    sql`CHECK (
      (is_free = true AND price = 0)
      OR (is_free = false AND billing_cycle IS NOT NULL)
    )`,
    sql`CHECK ((trial_enabled = false OR trial_days > 0))`,
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
    status: subscriptionStatusEnum("status").notNull().default("active"),
    listingsCount: integer("listings_count").notNull().default(0),
    autoRenew: boolean("auto_renew").notNull().default(true),

    startDate: timestamp("start_date").notNull().defaultNow(),
    endDate: timestamp("end_date").notNull().defaultNow(),

    type: subscriptionTypeEnum("type").default("paid"),
    cancelledAt: timestamp("cancelled_at"),

    pausedAt: timestamp("paused_at"),
    resumeAt: timestamp("resume_at"),
    ...timestamps,
  },
  (t) => [
    index("subscription_provider_idx").on(t.providerId),
    index("subscription_plan_idx").on(t.planId),
    index("subscription_status_idx").on(t.status),
    index("subscription_end_date_idx").on(t.endDate),
    uniqueIndex("one_active_subscription_per_provider")
      .on(t.providerId)
      .where(sql`status IN ('active', 'trialing')`),
  ],
);
