import { db } from "@/db";
import { plans, providers, subscriptions } from "@/db/schemas";
import {
  SubscriptionRow,
  SubscriptionsAnalytics,
  SubscriptionsFilters,
} from "@/lib/admin-types";
import { and, count, desc, eq, gte, sum, isNull, sql } from "drizzle-orm";

export async function getSubscriptions(
  filters: SubscriptionsFilters = {},
): Promise<{
  data: SubscriptionRow[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}> {
  const { status, planId, type, page = 1, perPage = 15 } = filters;
  const offset = (page - 1) * perPage;

  const conditions = [];

  if (status) {
    conditions.push(eq(subscriptions.status, status));
  }
  if (planId) {
    conditions.push(eq(subscriptions.planId, planId));
  }
  if (type) {
    conditions.push(eq(subscriptions.type, type));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: subscriptions.id,
        providerId: subscriptions.providerId,
        businessEmail: providers.businessEmail,
        provider: providers.name,
        serviceType: providers.serviceType,
        businessType: providers.businessType,
        providerStats: providers.status,
        planId: subscriptions.planId,
        planName: plans.name,
        planTier: plans.tier,
        planPrice: plans.price,
        status: subscriptions.status,
        startDate: subscriptions.startDate,
        endDate: subscriptions.endDate,
        type: subscriptions.type,
        listingsCount: subscriptions.listingsCount,
        autoRenew: subscriptions.autoRenew,
        pausedAt: subscriptions.pausedAt,
        resumeAt: subscriptions.resumeAt,
        cancelledAt: subscriptions.cancelledAt,
        createdAt: subscriptions.createdAt,
        updatedAt: subscriptions.updatedAt,
      })
      .from(subscriptions)
      .innerJoin(plans, eq(subscriptions.planId, plans.id))
      .innerJoin(providers, eq(providers.id, subscriptions.providerId))
      .where(where)
      .orderBy(desc(subscriptions.createdAt))
      .limit(perPage)
      .offset(offset),

    db.select({ total: count() }).from(subscriptions),
  ]);

  return {
    data: rows,
    total: Number(total),
    page,
    perPage,
    totalPages: Math.ceil(Number(total) / perPage),
  };
}

export async function getSubscriptionsAnalytics(): Promise<SubscriptionsAnalytics> {
  const now = new Date();
  const ninetyDaysAgo = new Date(now);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    statusCounts,
    [mrrResult],
    [trialsStarted],
    [trialsConverted],
    [cancelledThisMonth],
    mrrTrendRaw,
    planDistributionRaw,
  ] = await Promise.all([
    db
      .select({
        status: subscriptions.status,
        count: count(),
      })
      .from(subscriptions)
      .groupBy(subscriptions.status),

    db
      .select({
        mrr: sum(plans.price),
      })
      .from(subscriptions)
      .innerJoin(plans, eq(subscriptions.planId, plans.id))
      .where(
        and(eq(subscriptions.status, "active"), eq(subscriptions.type, "paid")),
      ),
    db
      .select({ count: count() })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.type, "trial"),
          gte(subscriptions.createdAt, ninetyDaysAgo),
        ),
      ),

    db
      .select({ count: count() })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.type, "paid"),
          isNull(subscriptions.cancelledAt),
          gte(subscriptions.createdAt, ninetyDaysAgo),
        ),
      ),
    db
      .select({ count: count() })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.status, "cancelled"),
          gte(subscriptions.cancelledAt, startOfMonth),
        ),
      ),

    db
      .select({
        month: sql<string>`to_char(date_trunc('month', ${subscriptions.startDate}), 'Mon')`,
        monthNum: sql<string>`date_trunc('month', ${subscriptions.startDate})`,
        mrr: sum(plans.price),
        newCount: count(),
      })
      .from(subscriptions)
      .innerJoin(plans, eq(subscriptions.planId, plans.id))
      .where(
        and(
          eq(subscriptions.status, "active"),
          eq(subscriptions.type, "paid"),
          gte(subscriptions.startDate, sixMonthsAgo),
        ),
      )
      .groupBy(
        sql`date_trunc('month', ${subscriptions.startDate})`,
        sql`to_char(date_trunc('month', ${subscriptions.startDate}), 'Mon')`,
      )
      .orderBy(sql`date_trunc('month', ${subscriptions.startDate})`),

    db
      .select({
        planName: plans.name,
        planTier: plans.tier,
        count: count(),
      })
      .from(subscriptions)
      .innerJoin(plans, eq(subscriptions.planId, plans.id))
      .where(eq(subscriptions.status, "active"))
      .groupBy(plans.id, plans.name, plans.tier)
      .orderBy(desc(count())),
  ]);

  const byStatus = Object.fromEntries(
    statusCounts.map((r) => [r.status, Number(r.count)]),
  );

  const activeCount = byStatus["active"] ?? 0;
  const trialingCount = byStatus["trialing"] ?? 0;
  const pausedCount = byStatus["paused"] ?? 0;
  const cancelledCount = byStatus["cancelled"] ?? 0;
  const expiredCount = byStatus["expired"] ?? 0;
  const totalSubscriptions = Object.values(byStatus).reduce((a, b) => a + b, 0);

  const mrr = Number(mrrResult?.mrr ?? 0);

  const started = Number(trialsStarted?.count ?? 0);
  const converted = Number(trialsConverted?.count ?? 0);

  const trialConversionRate =
    started > 0 ? Math.min(100, Math.round((converted / started) * 100)) : 0;

  // Churn rate: cancelled this month / active at start of month
  const churnRate =
    activeCount + Number(cancelledThisMonth?.count) > 0
      ? parseFloat(
          (
            (Number(cancelledThisMonth?.count) /
              (activeCount + Number(cancelledThisMonth?.count))) *
            100
          ).toFixed(1),
        )
      : 0;

  // MRR trend: last 6 months
  const months: string[] = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);

    months.push(
      date.toLocaleString("en-US", {
        month: "short",
      }),
    );
  }

  const trendMap = new Map(
    mrrTrendRaw.map((r) => [
      r.month,
      {
        mrr: Number(r.mrr ?? 0),
        newMrr: Number(r.mrr ?? 0),
        newCount: Number(r.newCount),
      },
    ]),
  );

  const mrrTrend = months.map((month) => {
    const existing = trendMap.get(month);

    return {
      month,
      mrr: existing?.mrr ?? 0,
      newMrr: existing?.newMrr ?? 0,
      newCount: existing?.newCount ?? 0,
    };
  });

  const planDistribution = planDistributionRaw.map((r) => ({
    planName: r.planName,
    planTier: r.planTier,
    count: Number(r.count),
  }));

  return {
    totalSubscriptions,
    activeCount,
    trialingCount,
    pausedCount,
    cancelledCount,
    expiredCount,
    mrr,
    trialConversionRate,
    churnRate,
    mrrTrend,
    planDistribution,
  };
}

export async function getActivePlans() {
  return db
    .select({
      id: plans.id,
      name: plans.name,
      tier: plans.tier,
      price: plans.price,
      billingCycle: plans.billingCycle,
    })
    .from(plans)
    .where(eq(plans.isActive, true))
    .orderBy(plans.price);
}
