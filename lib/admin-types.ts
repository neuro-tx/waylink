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

export interface UserStatsData {
  total: number;
  activeCount: number;
  bannedCount: number;
  admins: number;
  providers: number;
  permanentBans: number;
  temporaryBans: number;
}

export type DashboardKpis = {
  totalRevenue: number;
  revenueTrendPct: number;
  activeSubscriptions: number;
  mrr: number;
  totalBookings: number;
  bookingsTrendPct: number;
  activeProviders: number;
  pendingProviderApprovals: number;
  productsLive: number;
  productsPendingModeration: number;
};

export interface TopProvider {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  serviceType: ServiceType;
  businessType: "individual" | "company" | "agency";
  isVerified: boolean;
  totalRevenue: number;
  totalBookings: number;
  totalProducts: number;
  totalReviews: number;
  avgRating: number;
  joinedAt: Date | string;
}

interface RevenueByPlan {
  plan: string;
  mrr: number;
  subscriptions: number;
}

interface TrialConversion {
  totalTrials: number;
  convertedTrials: number;
  conversionRate: number;
}

interface ListingsUsage {
  used: number;
  capacity: number;
  unlimitedProviders: number;
}

export interface SubscriptionAnalytics {
  revenueByPlan: RevenueByPlan[];
  statusBreakdown: {
    status: SubscriptionStatus;
    count: number;
  }[];
  billingSplit: {
    monthly: number;
    yearly: number;
  };
  trialConversion: TrialConversion;
  listingsUsage: ListingsUsage;
  totalSubscriptions: number;
}

export interface SubscriptionOverview {
  totalSubs: number;
  tierDistribution: {
    tier: PlanTier;
    value: number;
  }[];
}
