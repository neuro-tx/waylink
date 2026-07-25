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
import { DashboardKpis } from "@/lib/admin-types";
import { BookingStatus } from "@/lib/all-types";
import { calculateGrowthMetric } from "@/lib/helpers";
import { DateRange } from "@/lib/panel-types";
import { getDateRange } from "@/lib/utils";
import { eq, gte, sql } from "drizzle-orm";

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
  const [topProviders, planTier] = await Promise.all([
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
  ]);

  return {
    topProviders,
    planTier,
  };
}

export { dashboardKpis, dahsboardAnalysis };
