import { cron } from "inngest";
import { inngest } from "../client";
import { db } from "@/db";
import { bookings, productReviews, products, productStats } from "@/db/schemas";
import { avg, count, InferInsertModel, max, sql } from "drizzle-orm";

type ProductStatsProps = InferInsertModel<typeof productStats>;

// Aggregate booking stats for ALL services.
async function calcServiceStats() {
  const bookingStats = await db
    .select({
      productId: bookings.productId,
      bookingsCount: count(),
      completedBookingsCount: sql<number>`count(*) filter (where ${bookings.status} = 'completed')`,
      cancelledBookingsCount: sql<number>`count(*) filter (where ${bookings.status} = 'cancelled')`,
      totalRevenue: sql<string>`coalesce(sum(${bookings.totalAmount}) filter (where ${bookings.status} in ('completed', 'confirmed')), 0)`,
      lastBookedAt: max(bookings.createdAt),
    })
    .from(bookings)
    .groupBy(bookings.productId);

  const reviewStats = await db
    .select({
      productId: productReviews.productId,
      reviewsCount: count(),
      averageRating: avg(productReviews.rating),
      lastReviewedAt: max(productReviews.createdAt),
    })
    .from(productReviews)
    .groupBy(productReviews.productId);

  return { bookingStats, reviewStats };
}

const updateProductStateWorker = inngest.createFunction(
  {
    id: "update-product-stats",
    triggers: [cron("0 6,14,22 * * *")],
  },
  async ({ step }) => {
    const services = await step.run("get-services", async () => {
      return db.select({ id: products.id }).from(products);
    });

    if (!services.length) {
      return { updated: 0 };
    }

    // Build a complete stats map.
    // Every service starts with zero/default values.
    const result = await step.run("build-stats", async () => {
      const { bookingStats, reviewStats } = await calcServiceStats();
      const statsMap = new Map<string, ProductStatsProps>();

      // Initialize every service with defaults.
      for (const service of services) {
        statsMap.set(service.id, {
          productId: service.id,
          bookingsCount: 0,
          completedBookingsCount: 0,
          cancelledBookingsCount: 0,
          reviewsCount: 0,
          averageRating: null,
          totalRevenue: "0.00",
          lastBookedAt: null,
          lastReviewedAt: null,
        });
      }

      // Merge booking and review aggregates.
      for (const booking of bookingStats) {
        const current = statsMap.get(booking.productId);
        if (!current) continue;

        Object.assign(current, {
          bookingsCount: booking.bookingsCount,
          completedBookingsCount: booking.completedBookingsCount,
          cancelledBookingsCount: booking.cancelledBookingsCount,
          totalRevenue: booking.totalRevenue,
          lastBookedAt: booking.lastBookedAt,
        });
      }

      for (const review of reviewStats) {
        const current = statsMap.get(review.productId);
        if (!current) continue;

        Object.assign(current, {
          reviewsCount: review.reviewsCount,
          averageRating: review.averageRating,
          lastReviewedAt: review.lastReviewedAt,
        });
      }

      // Bulk upsert all stats in a single query.
      const rows = [...statsMap.values()];

      const update = await db
        .insert(productStats)
        .values(rows)
        .onConflictDoUpdate({
          target: productStats.productId,
          set: {
            bookingsCount: sql.raw(
              `excluded.${productStats.bookingsCount.name}`,
            ),
            completedBookingsCount: sql.raw(
              `excluded.${productStats.completedBookingsCount.name}`,
            ),
            cancelledBookingsCount: sql.raw(
              `excluded.${productStats.cancelledBookingsCount.name}`,
            ),
            reviewsCount: sql.raw(`excluded.${productStats.reviewsCount.name}`),
            averageRating: sql.raw(
              `excluded.${productStats.averageRating.name}`,
            ),
            totalRevenue: sql.raw(`excluded.${productStats.totalRevenue.name}`),
            lastBookedAt: sql.raw(`excluded.${productStats.lastBookedAt.name}`),
            lastReviewedAt: sql.raw(
              `excluded.${productStats.lastReviewedAt.name}`,
            ),
          },
        });

      return {
        updated: update.rows.length,
      };
    });

    return result;
  },
);

export const productsFns = [updateProductStateWorker];
