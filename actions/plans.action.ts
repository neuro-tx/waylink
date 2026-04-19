"use server";

import { eq, and, desc, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type {
  Plan,
  Subscription,
  SubscribePayload,
  ActionResult,
  PlanBillingCycle,
  PlanTier,
} from "@/lib/all-types";
import { db } from "@/db";
import { plans, subscriptions } from "@/db/schemas";
import { getCurrentProvider } from "@/lib/provider-auth";

type TrialInput = {
  type: "trial";
  duration: number;
};

type PaidInput = {
  type: "paid";
  billingCycle: PlanBillingCycle;
};

type CalcEndDateInput = TrialInput | PaidInput;

async function requireProvider(secure?: boolean) {
  const { provider, role, status } = await getCurrentProvider();
  if (!provider || !role) throw new Error("Unauthorized.");

  if (secure) {
    if (status !== "ok") throw new Error("Permission denied.");
    const isPrivileged = role === "owner" || role === "manager";
    if (!isPrivileged) {
      throw new Error("Insufficient permissions.");
    }
  }

  return provider;
}

function revalidatePlanPaths() {
  revalidatePath("/provider/plans");
  revalidatePath("/provider");
}

// ─────────────────────────────────────────────────────────────────────────────
// Plan queries
// ─────────────────────────────────────────────────────────────────────────────

/** Fetch all active plans for a billing cycle, ordered by price asc. */
export async function getActivePlans(
  billingCycle: PlanBillingCycle,
): Promise<ActionResult<Plan[]>> {
  try {
    const rows = await db
      .select()
      .from(plans)
      .where(
        and(eq(plans.isActive, true), eq(plans.billingCycle, billingCycle)),
      )
      .orderBy(plans.price);

    return { success: true, data: rows };
  } catch (err: any) {
    console.error("[getActivePlans]", err);
    return { success: false, error: err.message ?? "Failed to load plans." };
  }
}

/** Fetch a single plan by its ID. */
export async function getPlanById(
  planId: string,
): Promise<ActionResult<Plan | null>> {
  try {
    const [row] = await db
      .select()
      .from(plans)
      .where(eq(plans.id, planId))
      .limit(1);

    return { success: true, data: (row as Plan) ?? null };
  } catch (err: any) {
    console.error("[getPlanById]", err);
    return { success: false, error: err.message ?? "Failed to load plan." };
  }
}

/** Fetch a single active plan by tier + billing cycle. */
export async function getPlanByTier(
  tier: PlanTier,
  billingCycle: PlanBillingCycle,
): Promise<ActionResult<Plan | null>> {
  try {
    const [row] = await db
      .select()
      .from(plans)
      .where(
        and(
          eq(plans.tier, tier),
          eq(plans.billingCycle, billingCycle),
          eq(plans.isActive, true),
        ),
      )
      .limit(1);

    return { success: true, data: (row as Plan) ?? null };
  } catch (err: any) {
    console.error("[getPlanByTier]", err);
    return { success: false, error: err.message ?? "Failed to load plan." };
  }
}

/** Fetch all plans for both billing cycles */
export async function getAllActivePlans(): Promise<
  ActionResult<{ monthly: Plan[]; yearly: Plan[] }>
> {
  try {
    const [monthly, yearly] = await Promise.all([
      getActivePlans("monthly"),
      getActivePlans("yearly"),
    ]);

    if (!monthly.success) return { success: false, error: monthly.error };
    if (!yearly.success) return { success: false, error: yearly.error };

    return {
      success: true,
      data: { monthly: monthly.data!, yearly: yearly.data! },
    };
  } catch (err: any) {
    console.error("[getAllActivePlans]", err);
    return { success: false, error: err.message ?? "Failed to load plans." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Subscription queries
// ─────────────────────────────────────────────────────────────────────────────

/** Fetch the provider's most recent subscription regardless of status. */
export async function getCurrentSubscription(): Promise<
  ActionResult<Subscription | null>
> {
  try {
    const provider = await requireProvider();

    const [row] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.providerId, provider.id))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);

    return { success: true, data: (row as Subscription) ?? null };
  } catch (err: any) {
    console.error("[getCurrentSubscription]", err);
    return {
      success: false,
      error: err.message ?? "Failed to load subscription.",
    };
  }
}

/** Fetch the provider's active or trialing subscription only. */
export async function getActiveSubscription(): Promise<
  ActionResult<Subscription | null>
> {
  try {
    const provider = await requireProvider();

    const [row] = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.providerId, provider.id),
          inArray(subscriptions.status, ["active", "trialing"]),
        ),
      )
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);

    return { success: true, data: (row as Subscription) ?? null };
  } catch (err: any) {
    console.error("[getActiveSubscription]", err);
    return {
      success: false,
      error: err.message ?? "Failed to load subscription.",
    };
  }
}

/** Fetch the provider's full subscription history. */
export async function getSubscriptionHistory(): Promise<
  ActionResult<Subscription[]>
> {
  try {
    const provider = await requireProvider();

    const rows = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.providerId, provider.id))
      .orderBy(desc(subscriptions.createdAt));

    return { success: true, data: rows as Subscription[] };
  } catch (err: any) {
    console.error("[getSubscriptionHistory]", err);
    return { success: false, error: err.message ?? "Failed to load history." };
  }
}

/** Check whether the provider has an active or trialing subscription. */
export async function hasActiveSubscription(): Promise<ActionResult<boolean>> {
  const result = await getActiveSubscription();
  if (!result.success) return { success: false, error: result.error };
  return { success: true, data: result.data !== null };
}

/**
 * Determines whether the provider has reached their listing limit.
 * - data:
 *    - true  → listing limit HAS been reached (cannot add more)
 *    - false → listing limit NOT reached (can still add listings)
 */
export async function hasReachedListingLimit(): Promise<ActionResult<boolean>> {
  try {
    const subResult = await getActiveSubscription();
    if (!subResult.success || !subResult.data) {
      return {
        success: false,
        error: subResult.error || "Could not load the active subscription.",
      };
    }

    const sub = subResult.data;
    const planResult = await getPlanById(sub.planId);
    if (!planResult.success || !planResult.data) {
      return { success: false, error: "Could not load plan details." };
    }

    const maxListings = planResult.data.maxListings;
    if (maxListings === null) return { success: true, data: false };

    return { success: true, data: sub.listingsCount >= maxListings };
  } catch (err: any) {
    console.error("[hasReachedListingLimit]", err);
    return { success: false, error: err.message ?? "Failed to check limit." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Subscription mutations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Cancel all active/trialing subscriptions for the current provider.
 * Internal helper — called before creating a new subscription.
 */
async function cancelExistingSubscriptions(providerId: string): Promise<void> {
  await db
    .update(subscriptions)
    .set({
      status: "cancelled",
      cancelledAt: new Date(),
      autoRenew: false,
    })
    .where(
      and(
        eq(subscriptions.providerId, providerId),
        inArray(subscriptions.status, ["trialing", "active"]),
      ),
    );
}

function computeEndDate(input: CalcEndDateInput): Date {
  const now = new Date();

  if (input.type === "trial") {
    if (!input.duration || input.duration <= 0) {
      throw new Error("Trial duration must be greater than 0");
    }

    const end = new Date(now);
    end.setDate(end.getDate() + input.duration);
    return end;
  }

  const end = new Date(now);

  if (input.billingCycle === "yearly") {
    end.setFullYear(end.getFullYear() + 1);
  } else {
    end.setMonth(end.getMonth() + 1);
  }

  return end;
}

export async function subscribeToPlan(
  payload: SubscribePayload,
): Promise<ActionResult<Subscription>> {
  try {
    const provider = await requireProvider(true);

    // Validate plan
    const [plan] = await db
      .select()
      .from(plans)
      .where(
        and(
          eq(plans.id, payload.planId),
          eq(plans.isActive, true),
          eq(plans.billingCycle, payload.billingCycle),
        ),
      )
      .limit(1);

    if (!plan) return { success: false, error: "Plan not found or inactive." };

    // Cancel existing subs
    await cancelExistingSubscriptions(provider.id);

    const dateConfig = ():
      | { type: "trial"; duration: number }
      | { type: "paid"; billingCycle: PlanBillingCycle } => {
      if (plan.trialEnabled) {
        return {
          type: "trial",
          duration: plan.trialDays ?? 0,
        };
      }

      return {
        type: "paid",
        billingCycle: plan.billingCycle,
      };
    };

    // Insert new subscription
    const now = new Date();
    const [newSub] = await db
      .insert(subscriptions)
      .values({
        providerId: provider.id,
        planId: plan.id,
        status: "active",
        startDate: now,
        endDate: computeEndDate(dateConfig()),
        autoRenew: plan.trialEnabled ? false : true,
      })
      .returning();

    revalidatePlanPaths();
    return { success: true, data: newSub as Subscription };
  } catch (err: any) {
    console.error("[subscribeToPlan]", err);
    return { success: false, error: err.message ?? "Failed to subscribe." };
  }
}

/**
 * pause the provider's active subscription at period end.
 * The sub stays active until currentPeriodEnd — provider keeps access.
 */
export async function pauseSubscription(): Promise<ActionResult> {
  try {
    const provider = await requireProvider();

    const [sub] = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.providerId, provider.id),
          eq(subscriptions.status, "active"),
        ),
      )
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);

    if (!sub) return { success: false, error: "No active subscription found." };

    await db
      .update(subscriptions)
      .set({
        autoRenew: false,
        pausedAt: new Date(),
        status: "paused",
      })
      .where(eq(subscriptions.id, sub.id));

    revalidatePlanPaths();
    return { success: true };
  } catch (err: any) {
    console.error("[cancelSubscription]", err);
    return { success: false, error: err.message ?? "Failed to cancel." };
  }
}

/**
 * Resume a paused subscription before period end.
 */
export async function resumeSubscription(): Promise<ActionResult> {
  try {
    const provider = await requireProvider();
    const now = new Date();

    const [sub] = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.providerId, provider.id),
          eq(subscriptions.status, "paused"),
        ),
      )
      .limit(1);

    if (!sub || !sub.pausedAt) {
      return {
        success: false,
        error: "No paused subscription found.",
      };
    }

    const pauseDuration = now.getTime() - new Date(sub?.pausedAt).getTime();

    const newEndDate = new Date(
      new Date(sub.endDate).getTime() + pauseDuration,
    );

    await db
      .update(subscriptions)
      .set({
        autoRenew: true,
        endDate: newEndDate,
        pausedAt: null,
        resumeAt: now,
      })
      .where(eq(subscriptions.id, sub.id));

    revalidatePlanPaths();
    return { success: true };
  } catch (err: any) {
    console.error("[resumeSubscription]", err);
    return { success: false, error: err.message ?? "Failed to resume." };
  }
}

export async function renewSubscription(): Promise<ActionResult<Subscription>> {
  try {
    const subResult = await getCurrentSubscription();
    if (!subResult.success || !subResult.data) {
      return { success: false, error: "No subscription to renew." };
    }

    const sub = subResult.data;
    const planResult = await getPlanById(sub.planId);
    if (!planResult.success || !planResult.data) {
      return { success: false, error: "Could not load plan." };
    }

    const plan = planResult.data;
    if (!plan.isActive) {
      return {
        success: false,
        error: "This plan is no longer available. Please choose a new plan.",
      };
    }

    return subscribeToPlan({
      planId: plan.id,
      billingCycle: plan.billingCycle,
    });
  } catch (err: any) {
    console.error("[renewSubscription]", err);
    return { success: false, error: err.message ?? "Failed to renew." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Listing count management
// ─────────────────────────────────────────────────────────────────────────────

/** Increment listingsCount on the active subscription by 1 (on adding a service). */
export async function incrementListingCount(): Promise<ActionResult> {
  try {
    const subResult = await getActiveSubscription();
    if (!subResult.success || !subResult.data) {
      return { success: false, error: "No active subscription." };
    }

    const sub = subResult.data;

    // Guard against exceeding limit
    const limitResult = await hasReachedListingLimit();
    if (limitResult.data === true) {
      return {
        success: false,
        error: "Listing limit reached. Please upgrade your plan.",
      };
    }

    await db
      .update(subscriptions)
      .set({ listingsCount: sql`${subscriptions.listingsCount} + 1` })
      .where(eq(subscriptions.id, sub.id));

    return { success: true };
  } catch (err: any) {
    console.error("[incrementListingCount]", err);
    return { success: false, error: err.message ?? "Failed to update count." };
  }
}

/** Decrement listingsCount on the active subscription by 1 (on removing a service). */
export async function decrementListingCount(): Promise<ActionResult> {
  try {
    const subResult = await getActiveSubscription();
    if (!subResult.success || !subResult.data) {
      return { success: false, error: "No active subscription." };
    }

    const sub = subResult.data;
    if (sub.listingsCount <= 0) return { success: true };

    await db
      .update(subscriptions)
      .set({
        listingsCount: sql`GREATEST(${subscriptions.listingsCount} - 1, 0)`,
      })
      .where(eq(subscriptions.id, sub.id));

    return { success: true };
  } catch (err: any) {
    console.error("[decrementListingCount]", err);
    return { success: false, error: err.message ?? "Failed to update count." };
  }
}
