"use server";

import { eq, and, desc, inArray, sql } from "drizzle-orm";
import { type NodePgDatabase } from "drizzle-orm/node-postgres";
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
import { detectSubscriptionAction, isExpired } from "@/lib/utils";

type DBTX = NodePgDatabase<any>;

const rules = {
  subscribe: (status?: string) =>
    !status || status === "cancelled" || status === "expired",
  cancel: (status?: string) =>
    !!status && status !== "cancelled" && status !== "expired",
  pause: (status?: string) => status === "active",
  resume: (status?: string) => status === "paused",
  upgrade: (status?: string) => status === "active",
  renew: (status?: string) => status === "expired" || status === "cancelled",
  expire: (status?: string) => status !== "expired",
};

function applyRules(actionType: keyof typeof rules, status?: string) {
  const isValid = rules[actionType](status);

  if (!isValid) {
    throw new Error(
      `Invalid action "${actionType}" for status "${status ?? "none"}"`,
    );
  }
}

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
          inArray(subscriptions.status, ["active", "trialing", "paused"]),
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
async function cancelExistingSubscriptions(tx: DBTX, providerId: string) {
  await tx
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

function computeEndDate(input: any): Date {
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

    return await db.transaction(async (tx) => {
      // 0. check if there is an active plan (active / trialing/ paused)
      const existing = await tx
        .select()
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.providerId, provider.id),
            inArray(subscriptions.status, ["active", "trialing", "paused"]),
          ),
        )
        .limit(1);

      if (existing.length) {
        throw new Error("Active subscription already exists");
      }

      // 1. Validate plan
      const [plan] = await tx
        .select()
        .from(plans)
        .where(
          and(
            eq(plans.id, payload.planId),
            eq(plans.isActive, true),
            payload.billingCycle
              ? eq(plans.billingCycle, payload.billingCycle)
              : undefined,
          ),
        )
        .limit(1);

      if (!plan) {
        throw new Error("Plan not found or inactive.");
      }

      // 2. Cancel existing (safe inside tx)
      await cancelExistingSubscriptions(tx, provider.id);

      // 3. Compute dates
      const config = plan.trialEnabled
        ? { type: "trial", duration: plan.trialDays ?? 0 }
        : { type: "paid", billingCycle: plan.billingCycle };

      const endDate = computeEndDate(config);

      // 4. Insert new sub
      const [newSub] = await tx
        .insert(subscriptions)
        .values({
          providerId: provider.id,
          planId: plan.id,
          status: plan.trialEnabled ? "trialing" : "active",
          startDate: new Date(),
          endDate,
          autoRenew: plan.trialEnabled ? false : true,
          type: plan.trialEnabled ? "trial" : "paid",
        })
        .returning();

      return { success: true, data: newSub as Subscription };
    });
  } catch (err: any) {
    console.error("[subscribeToPlan]", err);
    return {
      success: false,
      error: err.message ?? "Failed to subscribe.",
    };
  } finally {
    revalidatePlanPaths();
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
    if (isExpired(sub.endDate)) {
      return {
        success: false,
        error: "Subscription already ended",
      };
    }

    applyRules("pause", sub.status);

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

    if (!sub || !sub.pausedAt || sub.status !== "paused") {
      return {
        success: false,
        error: "No paused subscription found.",
      };
    }

    applyRules("resume", sub.status);

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
        status:"active"
      })
      .where(eq(subscriptions.id, sub.id));

    revalidatePlanPaths();
    return { success: true };
  } catch (err: any) {
    console.error("[resumeSubscription]", err);
    return { success: false, error: err.message ?? "Failed to resume." };
  }
}

export async function renewSubscription(
  subId: string,
): Promise<ActionResult<Subscription>> {
  try {
    const [subResult] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, subId))
      .limit(1);
    if (!subResult) {
      return { success: false, error: "No subscription to renew." };
    }
    applyRules("renew", subResult.status);

    const planResult = await getPlanById(subResult.planId);
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

/**
 * Cancel active/trialing subscriptions for the current provider.
 */
export async function cancelSubscription(
  subId: string,
  immediate = false,
): Promise<ActionResult<Subscription>> {
  try {
    const provider = await requireProvider(true);

    const [row] = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.providerId, provider.id),
          eq(subscriptions.id, subId),
        ),
      )
      .limit(1);

    if (!row) throw new Error("this subscription not avaliable");
    applyRules(immediate ? "expire":"cancel", row.status);

    const now = new Date();

    let nextStatus: "cancelled" | "expired";
    let cancelledAt: Date | null = null;
    let endDate: Date | undefined = undefined;

    if (immediate || isExpired(row.endDate)) {
      nextStatus = "expired";
      endDate = now;
    } else {
      nextStatus = "cancelled";
      cancelledAt = now;
    }

    await db
      .update(subscriptions)
      .set({
        status: nextStatus,
        autoRenew: false,
        cancelledAt,
        ...(endDate && { endDate }),
      })
      .where(eq(subscriptions.id, row.id));

    revalidatePlanPaths();
    return { success: true };
  } catch (err: any) {
    console.error("[cancelSubscription]", err);
    return { success: false, error: err.message ?? "Failed to cancel." };
  }
}

export async function upgradeSubscription(
  targetPlanId: string,
): Promise<ActionResult<Subscription>> {
  try {
    return await db.transaction(async (tx) => {
      const provider = await requireProvider(true);

      // 1. get current subscription + target plan
      const [[current], [targetPlan]] = await Promise.all([
        tx
          .select()
          .from(subscriptions)
          .where(
            and(
              eq(subscriptions.providerId, provider.id),
              inArray(subscriptions.status, ["active", "trialing", "paused"]),
            ),
          )
          .limit(1),

        tx.select().from(plans).where(eq(plans.id, targetPlanId)).limit(1),
      ]);

      if (!targetPlan) {
        throw new Error("Target plan not found");
      }

      // 2. get current plan safely
      const currentPlan = current
        ? await tx
            .select()
            .from(plans)
            .where(eq(plans.id, current.planId))
            .limit(1)
            .then(([p]) => p)
        : null;

      // 3. detect action
      const action = detectSubscriptionAction({
        currentTier: currentPlan?.tier,
        targetTier: targetPlan.tier,
      });

      if (action === "same") {
        throw new Error("You are already on this plan");
      }

      // 4. replace subscription
      await cancelExistingSubscriptions(tx, provider.id);

      const config = targetPlan.trialEnabled
        ? { type: "trial", duration: targetPlan.trialDays ?? 0 }
        : { type: "paid", billingCycle: targetPlan.billingCycle };

      const endDate = computeEndDate(config);

      const [newSub] = await tx
        .insert(subscriptions)
        .values({
          providerId: provider.id,
          planId: targetPlan.id,
          status: targetPlan.trialEnabled ? "trialing" : "active",
          startDate: new Date(),
          endDate,
          autoRenew: !targetPlan.trialEnabled,
          type: targetPlan.trialEnabled ? "trial" : "paid",
        })
        .returning();

      return {
        success: true,
        data: newSub as Subscription,
      };
    });
  } catch (err: any) {
    console.error("[upgradeSubscription]", err);
    return {
      success: false,
      error: err.message ?? "Failed to upgrade subscription",
    };
  } finally {
    revalidatePlanPaths();
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
