import {
  boolean,
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { memberRoleEnum, providerStatusEnum, providerTypeEnum } from "./enums";
import { location, timestamps } from "./shared";
import { user } from "./public";
import { sql } from "drizzle-orm";

export const providers = pgTable(
  "providers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),

    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),

    logo: text("logo"),
    cover: text("cover"),

    serviceType: providerTypeEnum("service_type").notNull(),
    businessType: text("business_type")
      .$type<"individual" | "company" | "agency">()
      .notNull(),

    location: uuid("location").references(() => location.id, {
      onDelete: "cascade",
    }),
    address: text("address"),
    status: providerStatusEnum("status").default("pending"),
    isVerified: boolean("is_verified").default(false),
    businessPhone: text("business_phone"),
    businessEmail: text("business_email"),
    ...timestamps,
  },
  (t) => [
    index("provider_name_idx").on(t.name),
    index("provider_email_idx").on(t.businessEmail),
    uniqueIndex("provider_owner_idx").on(t.ownerId),
    index("provider_status_idx").on(t.status),
    index("provider_type_idx").on(t.serviceType),
    uniqueIndex("provider_owner_type_idx").on(t.ownerId, t.serviceType),
  ],
);

export const providerMembers = pgTable(
  "provider_members",
  {
    providerId: uuid("provider_id")
      .notNull()
      .references(() => providers.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: memberRoleEnum("role").default("staff"),
    ...timestamps,
  },
  (t) => [
    primaryKey({ columns: [t.providerId, t.userId] }),
    index("provider_member_provider_idx").on(t.providerId),
    index("provider_member_user_provider_idx").on(t.userId, t.providerId),
  ],
);

export const providerInvites = pgTable(
  "provider_invites",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    providerId: uuid("provider_id")
      .notNull()
      .references(() => providers.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: memberRoleEnum("role").default("staff"),
    token: text("token").notNull().unique(),
    status: text("status")
      .$type<"pending" | "accepted" | "expired" | "cancelled">()
      .notNull()
      .default("pending"),
    invitedBy: text("invited_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    acceptedBy: text("accepted_by").references(() => user.id, {
      onDelete: "set null",
    }),
    acceptedAt: timestamp("accepted_at"),
    expiresAt: timestamp("expires_at")
      .notNull()
      .default(sql`NOW() + INTERVAL '7 days'`),

    ...timestamps,
  },
  (t) => [
    index("provider_invite_provider_idx").on(t.providerId),
    index("provider_invite_email_idx").on(t.email),
    index("provider_invite_token_idx").on(t.token),
    index("provider_invite_status_idx").on(t.status),
    uniqueIndex("provider_invite_unique_pending_idx").on(
      t.providerId,
      t.email,
      t.status,
    ),
  ],
);
