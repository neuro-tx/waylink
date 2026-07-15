import {
  BusinessType,
  PlanTier,
  Provider,
  ProviderStatus,
  ServiceType,
  SubscriptionStatus,
} from "./all-types";
import { StatusType } from "./panel-types";

export interface SubscriptionRow {
  id: string;
  providerId: string;
  businessEmail: string | null;
  provider: string;
  serviceType: ServiceType;
  businessType: BusinessType;
  providerStats: ProviderStatus | null;
  planId: string;
  planName: string;
  planTier: PlanTier;
  planPrice: number;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  type: "trial" | "paid" | null;
  listingsCount: number;
  autoRenew: boolean;
  pausedAt: Date | null;
  resumeAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionsFilters {
  status?: SubscriptionStatus;
  planId?: string;
  type?: "trial" | "paid";
  page?: number;
  perPage?: number;
}

export interface SubscriptionsAnalytics {
  totalSubscriptions: number;
  activeCount: number;
  trialingCount: number;
  pausedCount: number;
  cancelledCount: number;
  expiredCount: number;
  mrr: number;
  trialConversionRate: number;
  churnRate: number;
  mrrTrend: { month: string; mrr: number; newMrr: number }[];
  planDistribution: { planName: string; planTier: string; count: number }[];
}

export interface ActivePlans {
  id: string;
  name: string;
  tier: "free" | "pro" | "business" | "enterprise";
  price: number;
  billingCycle: "monthly" | "yearly";
}

export type SubscriptionsData = {
  subscriptions: {
    data: SubscriptionRow[];
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
  analytics: SubscriptionsAnalytics;
  activePlans: ActivePlans[];
};

export type MembersRoles = "owner" | "manager" | "staff";
export type InviteStatus = "pending" | "cancelled" | "expired" | "accepted";

export type Invites = {
  createdAt: Date;
  updatedAt: Date;
  id: string;
  providerId: string;
  message: string | null;
  role: MembersRoles;
  token: string;
  status: InviteStatus;
  senderId: string;
  receiverId: string;
  acceptedAt: Date | null;
  expiresAt: Date;
};

export type ProviderMemebers = {
  providerId: string;
  userId: string;
  role: MembersRoles;
  name: string;
  email: string;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductsSummary = {
  totalProducts: number;
  activeCount: number;
  draftCount: number;
  pausedCount: number;
  archivedCount: number;
  transportCount: number;
  experienceCount: number;
};

export type AdminProductsTableData = {
  id: string;
  title: string;
  slug: string;
  providerId: string;
  shortDescription: string;
  serviceType: ServiceType;
  status: StatusType;
  currency: string;
  basePrice: number;
  provider: Pick<Provider, "id" | "name" | "logo" | "isVerified" | "slug">;
  createdAt: Date | string;
  updatedAt: Date | string;
  reviews: number;
  bookings: number;
  avgRate: string | null;
  totalRevenue: string;
};

export type UserRole = "admin" | "provider" | "user";

export type ActionResult =
  | { success: true; message: string }
  | { success: false; message: string };

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  provider: "Provider",
  user: "Normal User",
};

export const ROLE_OPTIONS: {
  value: UserRole;
  label: string;
  description: string;
}[] = [
  {
    value: "admin",
    label: "Admin",
    description: "Full access to every admin tool, plan, and setting.",
  },
  {
    value: "provider",
    label: "Provider",
    description: "Manages their organization's staff, listings, and bookings.",
  },
  {
    value: "user",
    label: "User",
    description: "Standard customer-facing account with no admin access.",
  },
];

export interface UserStatsData {
  total: number;
  activeCount: number;
  bannedCount: number;
  admins: number;
  providers: number;
  permanentBans: number;
  temporaryBans: number;
}
