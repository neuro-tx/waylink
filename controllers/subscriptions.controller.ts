"use server";

import { adminAuth } from "@/lib/admin-auth";
import { SubscriptionsData, SubscriptionsFilters } from "@/lib/admin-types";
import { SubscriptionStatus } from "@/lib/all-types";
import {
  getSubscriptions,
  getSubscriptionsAnalytics,
  getActivePlans,
} from "@/services/subscriptions.service";

export async function getSubscriptionsData(
  filters?: SubscriptionsFilters,
): Promise<SubscriptionsData> {
  const { status } = await adminAuth();
  if (status !== "ok") throw new Error("access not allowed");

  const [subscriptions, analytics, activePlans] = await Promise.all([
    getSubscriptions(filters),
    getSubscriptionsAnalytics(),
    getActivePlans(),
  ]);

  return { subscriptions, analytics, activePlans };
}
