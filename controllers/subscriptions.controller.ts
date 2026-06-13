import { adminAuth } from "@/lib/admin-auth";
import {
  getSubscriptions,
  getSubscriptionsAnalytics,
  getActivePlans,
} from "@/services/subscriptions.service";

export async function getSubscriptionsData() {
  const { status } = await adminAuth();
  if (status !== "ok") throw new Error("access not allowed");

  const res = await Promise.all([
    getSubscriptions(),
    getSubscriptionsAnalytics(),
    getActivePlans(),
  ]);

  return res;
}
