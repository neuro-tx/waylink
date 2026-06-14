import {
  BusinessType,
  PlanTier,
  ProviderStatus,
  ServiceType,
  SubscriptionStatus,
} from "./all-types";

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
