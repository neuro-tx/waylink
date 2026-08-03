"use server";

import { db } from "@/db";
import {
  bookings,
  bookingsFinancial,
  plans,
  products,
  providers,
  providerStats,
  subscriptions,
} from "@/db/schemas";
import {
  DashboardInsight,
  DashboardKpis,
  InsightVariant,
  SubscriptionOverview,
} from "@/lib/admin-types";
import { PlanTier } from "@/lib/all-types";
import { calculateGrowthMetric } from "@/lib/helpers";
import { DateRange } from "@/lib/panel-types";
import { getComparisonDateRange, getDateRange, shiftDate } from "@/lib/utils";
import { and, eq, inArray, lte, sql } from "drizzle-orm";

async function dashboardKpis(range: DateRange = "30d"): Promise<DashboardKpis> {
  const { from, to } = getDateRange(range);

  const [revenue, bookingsStats, providerStats, productStats, subStats] =
    await Promise.all([
      db
        .select({
          totalRevenue: sql<number>`COALESCE(SUM(${bookingsFinancial.totalAmount}), 0)::float`,
          currentMonth: sql<number>`COALESCE(SUM(${bookingsFinancial.totalAmount}) FILTER (WHERE ${bookingsFinancial.createdAt} >= ${to}), 0)::float`,
          lastMonth: sql<number>`COALESCE(SUM(${bookingsFinancial.totalAmount}) FILTER (WHERE ${bookingsFinancial.createdAt} >= ${from} AND ${bookingsFinancial.createdAt} < ${to}), 0)::float`,
        })
        .from(bookingsFinancial),
      db
        .select({
          totalBookings: sql<number>`COUNT(*)::int`,
          currentMonth: sql<number>`COUNT(*) FILTER (WHERE ${bookings.createdAt} >= ${to})::int`,
          lastMonth: sql<number>`COUNT(*) FILTER (WHERE ${bookings.createdAt} >= ${from} AND ${bookings.createdAt} < ${to})::int`,
        })
        .from(bookings),
      db
        .select({
          active: sql<number>`COUNT(*) FILTER (WHERE ${providers.status} = 'approved')::int`,
          pending: sql<number>`COUNT(*) FILTER (WHERE ${providers.status} = 'pending')::int`,
        })
        .from(providers),
      db
        .select({
          live: sql<number>`COUNT(*) FILTER (WHERE ${products.status} = 'active')::int`,
          pendingModeration: sql<number>`COUNT(*) FILTER (WHERE ${products.status} = 'draft')::int`,
        })
        .from(products),
      db
        .select({
          activeSubscriptions: sql<number>`COUNT(*) FILTER (WHERE ${subscriptions.status} IN ('active', 'trialing'))::int`,
          mrr: sql<number>`COALESCE(SUM(${plans.price}) FILTER (WHERE ${subscriptions.status} NOT IN ('cancelled' , 'expired') AND ${plans.billingCycle} = 'monthly'), 0)::float`,
          yrr: sql<number>`COALESCE(SUM(${plans.price}) FILTER (WHERE ${subscriptions.status} NOT IN ('cancelled' , 'expired') AND ${plans.billingCycle} = 'yearly'), 0)::float`,
        })
        .from(subscriptions)
        .innerJoin(plans, eq(subscriptions.planId, plans.id)),
    ]);

  const revenueRow = revenue[0];
  const bookingsRow = bookingsStats[0];

  return {
    totalRevenue: revenueRow.totalRevenue,
    revenueTrend: calculateGrowthMetric(
      revenueRow.currentMonth,
      revenueRow.lastMonth,
    ),
    activeSubscriptions: subStats[0].activeSubscriptions,
    mrr: subStats[0].mrr,
    totalBookings: bookingsRow.totalBookings,
    bookingsTrend: calculateGrowthMetric(
      bookingsRow.currentMonth,
      bookingsRow.lastMonth,
    ),
    activeProviders: providerStats[0].active,
    pendingProviderApprovals: providerStats[0].pending,
    productsLive: productStats[0].live,
    productsPendingModeration: productStats[0].pendingModeration,
  };
}

async function dahsboardAnalysis() {
  const [topProviders, planTier, subsAnalysis, totalSubsResult] =
    await Promise.all([
      db
        .select({
          id: providers.id,
          name: providers.name,
          slug: providers.slug,
          logo: providers.logo,
          serviceType: providers.serviceType,
          businessType: providers.businessType,
          isVerified: providers.isVerified,
          joinedAt: providers.createdAt,
          totalRevenue: providerStats.totalRevenue,
          totalBookings: providerStats.totalBookings,
          totalProducts: providerStats.totalProducts,
          totalReviews: providerStats.totalReviews,
          avgRating: providerStats.avgRating,
        })
        .from(providers)
        .innerJoin(providerStats, eq(providers.id, providerStats.providerId))
        .limit(10),

      db
        .select({
          tier: plans.tier,
          totalRevenue: sql<number>`SUM(${bookingsFinancial.totalAmount})::float`,
          totalCommission: sql<number>`SUM(${bookingsFinancial.totalAmount} * ${bookingsFinancial.commission} / 100)::float`,
          bookingsCount: sql<number>`COUNT(*)::int`,
        })
        .from(bookingsFinancial)
        .innerJoin(plans, eq(bookingsFinancial.planId, plans.id))
        .groupBy(plans.tier)
        .orderBy(sql`SUM(${bookingsFinancial.totalAmount}) DESC`),

      db
        .select({
          tier: plans.tier,
          value: sql<number>`COUNT(${subscriptions.id})::int`,
        })
        .from(plans)
        .leftJoin(subscriptions, eq(plans.id, subscriptions.planId))
        .groupBy(plans.tier),

      db
        .select({
          totalSubs: sql<number>`COUNT(${subscriptions.id})::int`,
        })
        .from(subscriptions),
    ]);

  const ALL_TIERS: PlanTier[] = ["free", "pro", "business", "enterprise"];
  const subsMap = new Map(subsAnalysis.map((item) => [item.tier, item.value]));

  const subscriptionOverview: SubscriptionOverview = {
    totalSubs: totalSubsResult[0]?.totalSubs ?? 0,
    tierDistribution: ALL_TIERS.map((tier) => ({
      tier,
      value: subsMap.get(tier) ?? 0,
    })),
  };

  return {
    topProviders,
    planTier,
    subscriptionOverview,
  };
}

async function dashboardInsights(
  range: DateRange = "30d",
): Promise<DashboardInsight[]> {
  const { current, previous } = getComparisonDateRange(range);

  const [revenueTrend, pendingApprovals, moderationBacklog, bookingTrend] =
    await Promise.all([
      db
        .select({
          current: sql<number>`
            COALESCE(
              SUM(${bookingsFinancial.totalAmount})
              FILTER (
                WHERE ${bookingsFinancial.createdAt} >= ${current.from}
                AND ${bookingsFinancial.createdAt} <= ${current.to}
              ),
              0
            )::float
          `,
          previous: sql<number>`
            COALESCE(
              SUM(${bookingsFinancial.totalAmount})
              FILTER (
                WHERE ${bookingsFinancial.createdAt} >= ${previous.from}
                AND ${bookingsFinancial.createdAt} <= ${previous.to}
              ),
              0
            )::float
          `,
        })
        .from(bookingsFinancial),

      db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(providers)
        .where(eq(providers.status, "pending")),

      db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(products)
        .where(eq(products.status, "draft")),

      db
        .select({
          current: sql<number>`
            COUNT(*)
            FILTER (
              WHERE ${bookings.createdAt} >= ${current.from}
              AND ${bookings.createdAt} <= ${current.to}
            )::int
          `,
          previous: sql<number>`
            COUNT(*)
            FILTER (
              WHERE ${bookings.createdAt} >= ${previous.from}
              AND ${bookings.createdAt} <= ${previous.to}
            )::int
          `,
        })
        .from(bookings),
    ]);

  const insights: DashboardInsight[] = [];

  const rev = revenueTrend[0];
  const pending = pendingApprovals[0].count;
  const backlog = moderationBacklog[0].count;
  const bookingMetrics = bookingTrend[0];

  // Revenue movement
  const revChangePct =
    rev.previous > 0 ? ((rev.current - rev.previous) / rev.previous) * 100 : 0;

  if (revChangePct >= 15) {
    insights.push({
      id: "revenue-up",
      variant: "success",
      title: "Revenue is climbing",
      description: `Up ${revChangePct.toFixed(1)}% compared to the previous period.`,
      value: `$${rev.current.toLocaleString("en-US")}`,
    });
  } else if (revChangePct <= -15) {
    insights.push({
      id: "revenue-down",
      variant: "critical",
      title: "Revenue is declining",
      description: `Down ${Math.abs(revChangePct).toFixed(1)}% compared to the previous period.`,
      value: `$${rev.current.toLocaleString("en-US")}`,
    });
  }

  // Provider approval backlog
  if (pending >= 10) {
    insights.push({
      id: "provider-backlog",
      variant: "warning",
      title: "Provider approvals piling up",
      description: `${pending} providers are waiting for review.`,
      value: String(pending),
    });
  } else if (pending > 0) {
    insights.push({
      id: "provider-pending",
      variant: "info",
      title: "Providers awaiting approval",
      description: `${pending} provider${pending > 1 ? "s" : ""} in the queue.`,
      value: String(pending),
    });
  }

  // Product moderation backlog
  if (backlog >= 15) {
    insights.push({
      id: "moderation-backlog",
      variant: "warning",
      title: "Product moderation queue is growing",
      description: `${backlog} drafts are waiting for review.`,
      value: String(backlog),
    });
  }

  // Booking momentum
  const bookingChangePct =
    bookingMetrics.previous > 0
      ? ((bookingMetrics.current - bookingMetrics.previous) /
          bookingMetrics.previous) *
        100
      : 0;

  if (bookingChangePct >= 20) {
    insights.push({
      id: "bookings-momentum",
      variant: "success",
      title: "Bookings are accelerating",
      description: `${bookingMetrics.current} bookings, up ${bookingChangePct.toFixed(0)}% compared to the previous period.`,
      value: String(bookingMetrics.current),
    });
  } else if (bookingChangePct <= -20 && bookingMetrics.previous > 0) {
    insights.push({
      id: "bookings-slowdown",
      variant: "critical",
      title: "Bookings slowed down",
      description: `${bookingMetrics.current} bookings compared to ${bookingMetrics.previous} in the previous period.`,
      value: String(bookingMetrics.current),
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: "all-clear",
      variant: "info",
      title: "Everything looks steady",
      description:
        "No unusual movement in revenue, bookings, or operational metrics right now.",
    });
  }

  return insights;
}

async function subscriptionInsights(
  range: DateRange = "30d",
): Promise<DashboardInsight[]> {
  const { current, previous } = getComparisonDateRange(range);

  const last30Days = current.from;
  const prev30Days = previous.from;
  const next7Days = shiftDate("day", -7);

  const [expiringSoon, churnWindow, trialConversions, planPopularity] =
    await Promise.all([
      db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(subscriptions)
        .where(
          and(
            inArray(subscriptions.status, ["active", "trialing"]),
            lte(subscriptions.endDate, next7Days),
            eq(subscriptions.autoRenew, false),
          ),
        ),

      db
        .select({
          cancelledRecent: sql<number>`COUNT(*) FILTER (WHERE ${subscriptions.cancelledAt} >= ${last30Days})::int`,
          cancelledPrior: sql<number>`COUNT(*) FILTER (WHERE ${subscriptions.cancelledAt} >= ${prev30Days} AND ${subscriptions.cancelledAt} < ${last30Days})::int`,
        })
        .from(subscriptions),

      db
        .select({
          trialing: sql<number>`COUNT(*) FILTER (WHERE ${subscriptions.status} = 'trialing')::int`,
          convertedRecent: sql<number>`COUNT(*) FILTER (WHERE ${subscriptions.type} = 'paid' AND ${subscriptions.createdAt} >= ${last30Days})::int`,
        })
        .from(subscriptions),

      db
        .select({
          tier: plans.tier,
          count: sql<number>`COUNT(*)::int`,
        })
        .from(subscriptions)
        .innerJoin(plans, eq(subscriptions.planId, plans.id))
        .where(inArray(subscriptions.status, ["active", "trialing"]))
        .groupBy(plans.tier)
        .orderBy(sql`COUNT(*) DESC`)
        .limit(1),
    ]);

  const insights: DashboardInsight[] = [];
  const expiring = expiringSoon[0].count;
  const churn = churnWindow[0];
  const trial = trialConversions[0];
  const topTier = planPopularity[0];

  if (expiring > 0) {
    insights.push({
      id: "subs-expiring",
      variant: expiring >= 10 ? "warning" : "info",
      title: "Subscriptions expiring without renewal",
      description: `${expiring} won't auto-renew in the next 7 days.`,
      value: String(expiring),
    });
  }

  const churnChangePct =
    churn.cancelledPrior > 0
      ? ((churn.cancelledRecent - churn.cancelledPrior) /
          churn.cancelledPrior) *
        100
      : 0;
  if (churnChangePct >= 25 && churn.cancelledRecent >= 3) {
    insights.push({
      id: "churn-spike",
      variant: "critical",
      title: "Cancellations trending up",
      description: `${churn.cancelledRecent} cancellations in 30 days, up ${churnChangePct.toFixed(0)}% vs prior period.`,
      value: String(churn.cancelledRecent),
    });
  }

  if (trial.trialing > 0) {
    insights.push({
      id: "trials-active",
      variant: "info",
      title: "Providers currently on trial",
      description: `${trial.trialing} active trials — watch for conversion after they end.`,
      value: String(trial.trialing),
    });
  }

  if (topTier) {
    insights.push({
      id: "top-tier",
      variant: "success",
      title: "Most popular plan tier",
      description: `${topTier.tier} is the leading tier by active subscriptions.`,
      value: String(topTier.count),
    });
  }

  return insights;
}

async function getInsights(range: DateRange = "30d") {
  const [financial, subscription] = await Promise.all([
    dashboardInsights(range),
    subscriptionInsights(range),
  ]);

  const all = [...financial, ...subscription];

  const severityOrder: Record<InsightVariant, number> = {
    critical: 0,
    warning: 1,
    success: 2,
    info: 3,
  };

  return all.sort(
    (a, b) => severityOrder[a.variant] - severityOrder[b.variant],
  );
}

export { dashboardKpis, dahsboardAnalysis, getInsights };
