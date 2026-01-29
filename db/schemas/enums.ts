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
