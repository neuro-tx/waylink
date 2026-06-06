import { db } from "@/db";
import {
  bookings,
  plans,
  productReviews,
  products,
  providers,
  providerStats,
  subscriptions,
} from "@/db/schemas";
import { avg, count, eq, inArray, InferInsertModel, sql } from "drizzle-orm";
import { inngest } from "../client";
import { cron } from "inngest";

type ProviderStatsRow = InferInsertModel<typeof providerStats>;

async function providerStatsData() {
  const [bookingStats, productStats, reviewStats, planStats] =
    await Promise.all([
      db
        .select({
          providerId: bookings.providerId,
          totalBookings: count(),
          totalRevenue: sql<string>`coalesce(sum(${bookings.totalAmount}) filter (where ${bookings.status} in ('completed', 'confirmed')), 0)`,
        })
        .from(bookings)
        .groupBy(bookings.providerId),

      db
        .select({
          providerId: products.providerId,
          totalProducts: count(),
        })
        .from(products)
        .groupBy(products.providerId),

      db
        .select({
          providerId: products.providerId,
          totalReviews: count(productReviews.id),
          avgRating: avg(productReviews.rating),
        })
        .from(products)
        .leftJoin(productReviews, eq(productReviews.productId, products.id))
        .groupBy(products.providerId),

      db
        .select({
          providerId: subscriptions.providerId,
          maxListings: plans.maxListings,
          listingsCount: subscriptions.listingsCount,
        })
        .from(subscriptions)
        .leftJoin(plans, eq(plans.id, subscriptions.planId))
        .where(inArray(subscriptions.status, ["active", "trialing", "paused"])),
    ]);

  return {
    bookingStats,
    productStats,
    reviewStats,
    planStats,
  };
}

const updateProvidersWorker = inngest.createFunction(
  {
    id: "update-provider-stats",
    triggers: [cron("0 0,12 * * *")],
  },
  async ({ step }) => {
    const mainProviders = await step.run("get-providers", async () => {
      return await db
        .select()
        .from(providers)
        .where(inArray(providers.status, ["approved", "suspended"]));
    });

    if (!mainProviders) return { updated: 0 };

    const result = await step.run("clac-main-stats", async () => {
      const { bookingStats, planStats, productStats, reviewStats } =
        await providerStatsData();
      // initialize defaults from providers list
      const statsMap = new Map<string, ProviderStatsRow>();

      for (const provider of mainProviders) {
        statsMap.set(provider.id, {
          providerId: provider.id,
          totalProducts: 0,
          totalReviews: 0,
          avgRating: "0",
          totalRevenue: 0,
          totalBookings: 0,
          maxListings: null,
          remainingListings: null,
          canCreateListing: false,
        });
      }

      for (const b of bookingStats) {
        const row = statsMap.get(b.providerId);
        if (!row) continue;

        row.totalBookings = b.totalBookings;
        row.totalRevenue = Number(b.totalRevenue);
      }

      for (const p of productStats) {
        const row = statsMap.get(p.providerId);
        if (!row) continue;

        row.totalProducts = p.totalProducts;
      }

      for (const r of reviewStats) {
        const row = statsMap.get(r.providerId);
        if (!row) continue;

        row.totalReviews = r.totalReviews;
        row.avgRating = r.avgRating ? r.avgRating.toString() : "0";
      }

      for (const p of planStats) {
        const row = statsMap.get(p.providerId);
        if (!row) continue;

        const hasSubscription =
          p.maxListings !== undefined && p.listingsCount !== undefined;

        // No subscription
        if (!hasSubscription) {
          row.canCreateListing = false;
          row.maxListings = 0;
          row.remainingListings = 0;
          continue;
        }

        // Unlimited plan
        if (p.maxListings === null) {
          row.canCreateListing = true;
          row.maxListings = 0;
          row.remainingListings = 0;
          continue;
        }

        // Limited plan
        row.canCreateListing = p.listingsCount < p.maxListings;
        row.maxListings = p.maxListings;
        row.remainingListings = Math.max(0, p.maxListings - p.listingsCount);
      }

      const rows = [...statsMap.values()];

      await db
        .insert(providerStats)
        .values(rows)
        .onConflictDoUpdate({
          target: providerStats.providerId,
          set: {
            totalProducts: sql.raw(
              `excluded.${providerStats.totalProducts.name}`,
            ),
            totalReviews: sql.raw(
              `excluded.${providerStats.totalReviews.name}`,
            ),
            avgRating: sql.raw(`excluded.${providerStats.avgRating.name}`),
            totalRevenue: sql.raw(
              `excluded.${providerStats.totalRevenue.name}`,
            ),
            totalBookings: sql.raw(
              `excluded.${providerStats.totalBookings.name}`,
            ),
            maxListings: sql.raw(`excluded.${providerStats.maxListings.name}`),
            remainingListings: sql.raw(
              `excluded.${providerStats.remainingListings.name}`,
            ),
            canCreateListing: sql.raw(
              `excluded.${providerStats.canCreateListing.name}`,
            ),
          },
        });

      return {
        updated: rows.length,
      };
    });

    return result;
  },
);

export const providerFns = [updateProvidersWorker];
