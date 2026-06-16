"use server";

import { adminAuth } from "@/lib/admin-auth";
import { SubscriptionsData, SubscriptionsFilters } from "@/lib/admin-types";
import {
  getSubscriptions,
  getSubscriptionsAnalytics,
  getActivePlans,
  getPlanSubscriptions,
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

export async function getPlanSubscriptionsData(
  planId: string,
  limit?: number,
  offset?: number,
) {
  if (!planId) throw new Error("Missing plan id");

  const { admin, status } = await adminAuth();
  if (status !== "ok" || !admin) {
    throw new Error("Access not allowed");
  }

  limit = limit ?? 10;
  offset = offset ?? 0;
  return await getPlanSubscriptions(planId, limit, offset);
}
