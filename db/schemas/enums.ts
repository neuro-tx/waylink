import { pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("user_role", ["user", "provider", "admin"]);

export const providerStatusEnum = pgEnum("provider_status", [
  "pending",
  "approved",
  "suspended",
  "inactive"
]);

export const providerTypeEnum = pgEnum("provider_type", [
  "transport",
  "accommodation",
  "experience",
]);

export const agreementStatus = pgEnum("agreement_status", [
  "pending",
  "active",
  "expired",
  "terminated"
]);

export const memberRoleEnum = pgEnum("member_role", [
  "owner",
  "manager", 
  "staff",
]);