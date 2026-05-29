import { db } from "@/db";
import {
  plans,
  productScores,
  productStats,
  productVariants,
  setupProgress,
  subscriptions,
} from "@/db/schemas";
import { and, eq, min } from "drizzle-orm";

const SCORE_CONFIG = {
  bayesian: {
    minReviews: 10,
    globalAvg: 4.1,
  },
  weights: {
    popularity: 0.4,
    price: 0.2,
    rating: 0.4,
  },
  price: {
    maxValueRatio: 2.5,
  },
  popularity: {
    recentWeekBoost: 16,
    recentMonthBoost: 8,
    recent90DaysBoost: 4,
  },
} as const;

// HELPERS
function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function safeNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getDaysAgo(date: Date | string): number {
  return (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24);
}

function getRecencyBoost(lastBookedAt: Date | string | null): number {
  if (!lastBookedAt) return 0;

  const days = getDaysAgo(lastBookedAt);

  if (days <= 7) {
    return SCORE_CONFIG.popularity.recentWeekBoost;
  }

  if (days <= 30) {
    return SCORE_CONFIG.popularity.recentMonthBoost;
  }

  if (days <= 90) {
    return SCORE_CONFIG.popularity.recent90DaysBoost;
  }

  return 0;
}

//  POPULARITY SCORE
export function calcPopularityScore(stats: {
  bookingsCount: number;
  completedBookingsCount: number;
  cancelledBookingsCount: number;
  lastBookedAt: Date | string | null;
}): number {
  const bookings = safeNumber(stats.bookingsCount);
  const completed = safeNumber(stats.completedBookingsCount);
  const cancelled = safeNumber(stats.cancelledBookingsCount);
  const qualityFactor = completed - cancelled * 0.5;

  const rawScore =
    bookings * 0.5 + qualityFactor + getRecencyBoost(stats.lastBookedAt);

  const safeScore = Math.max(rawScore, 0);
  const normalized = (Math.log10(safeScore + 1) / 4) * 100;

  return Math.round(clamp(normalized));
}

// RATING SCORE
export function calcRatingScore(stats: {
  reviewsCount: number;
  averageRating: string | number | null;
}): number {
  const averageRating = safeNumber(stats.averageRating);
  const reviewsCount = safeNumber(stats.reviewsCount);

  const { globalAvg, minReviews } = SCORE_CONFIG.bayesian;

  const weightedRating =
    (reviewsCount / (reviewsCount + minReviews)) * averageRating +
    (minReviews / (reviewsCount + minReviews)) * globalAvg;

  return Math.round(clamp((weightedRating / 5) * 100));
}

// PRICE SCORE
export function calcPriceScore(params: {
  averageRating: string | number | null;
  lowestPrice: number | null;
}): number {
  const rating = safeNumber(params.averageRating);
  const price = safeNumber(params.lowestPrice);

  if (price <= 0) {
    return 50;
  }

  /**
   * Value score:
   *
   * Higher rating
   * Lower price
   * => Higher score
   */
  const valueRatio = rating / Math.log(price + 10);
  const normalized = (valueRatio / SCORE_CONFIG.price.maxValueRatio) * 100;

  return Math.round(clamp(normalized));
}

// FINAL SCORE
export function calcMainScore(scores: {
  popularity: number;
  price: number;
  rating: number;
  priorityBoost?: number | string | null;
}): number {
  const popularity = clamp(safeNumber(scores.popularity));
  const price = clamp(safeNumber(scores.price));
  const rating = clamp(safeNumber(scores.rating));

  const priorityMultiplier = safeNumber(scores.priorityBoost, 1);

  const weightedScore =
    popularity * SCORE_CONFIG.weights.popularity +
    price * SCORE_CONFIG.weights.price +
    rating * SCORE_CONFIG.weights.rating;

  const finalScore = weightedScore * priorityMultiplier;

  return Math.round(clamp(finalScore));
}

export function generateScore(data: {
  bookingsCount: number;
  completedBookingsCount: number;
  cancelledBookingsCount: number;
  lastBookedAt: Date | string | null;
  reviewsCount: number;
  averageRating: string | number | null;
  lowestPrice: number | null;
  priorityBoost?: number | string | null;
}) {
  const popularity = calcPopularityScore({
    bookingsCount: data.bookingsCount,
    completedBookingsCount: data.completedBookingsCount,
    cancelledBookingsCount: data.cancelledBookingsCount,
    lastBookedAt: data.lastBookedAt,
  });

  const rating = calcRatingScore({
    reviewsCount: data.reviewsCount,
    averageRating: data.averageRating,
  });

  const price = calcPriceScore({
    averageRating: data.averageRating,
    lowestPrice: data.lowestPrice,
  });

  const finalScore = calcMainScore({
    popularity,
    rating,
    price,
    priorityBoost: data.priorityBoost,
  });

  return {
    popularity,
    rating,
    price,
    finalScore,
  };
}

export async function getLowestPrice(serviceId: string): Promise<number> {
  try {
    const [result] = await db
      .select({
        value: min(productVariants.adultPrice),
      })
      .from(productVariants)
      .where(eq(productVariants.productId, serviceId));

    return safeNumber(result?.value);
  } catch (error) {
    console.error("Failed to get lowest price", {
      serviceId,
      error,
    });

    return 0;
  }
}

export async function getServiceStats(
  serviceId: string,
): Promise<typeof productStats.$inferSelect> {
  try {
    const [existing] = await db
      .select()
      .from(productStats)
      .where(eq(productStats.productId, serviceId))
      .limit(1);

    if (existing) {
      return existing;
    }

    // Creat If Missing
    const [created] = await db
      .insert(productStats)
      .values({
        productId: serviceId,
      })
      .onConflictDoNothing({
        target: productStats.productId,
      })
      .returning();

    if (!created) throw new Error("Failed to create service stats");
    return created;
  } catch (error) {
    console.error("Failed to get or create service stats", {
      serviceId,
      error,
    });

    throw error;
  }
}

export async function getPriorityBoost(providerId: string): Promise<number> {
  try {
    const [result] = await db
      .select({ boost: plans.priorityBoost })
      .from(subscriptions)
      .innerJoin(plans, eq(plans.id, subscriptions.planId))
      .where(
        and(
          eq(subscriptions.providerId, providerId),
          eq(subscriptions.status, "active"),
        ),
      )
      .limit(1);

    return safeNumber(result?.boost, 1);
  } catch {
    return 1;
  }
}

export async function persistScoreResults(params: {
  serviceId: string;
  updateProgress?: boolean;
  scores: {
    popularity: number;
    price: number;
    rating: number;
    finalScore: number;
  };
}) {
  const { serviceId, scores, updateProgress } = params;

  try {
    return await db.transaction(async (tx) => {
      const [result] = await tx
        .insert(productScores)
        .values({
          productId: serviceId,
          popularityScore: scores.popularity,
          priceScore: scores.price,
          ratingScore: scores.rating,
          finalScore: scores.finalScore,
          computedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: productScores.productId,
          set: {
            popularityScore: scores.popularity,
            priceScore: scores.price,
            ratingScore: scores.rating,
            finalScore: scores.finalScore,
            computedAt: new Date(),
          },
        })
        .returning();

      if (!result) {
        throw new Error("Failed to update product score");
      }

      // optional onboarding progress update
      if (updateProgress) {
        await tx
          .insert(setupProgress)
          .values({
            productId: serviceId,
            hasScore: true,
          })
          .onConflictDoUpdate({
            target: setupProgress.productId,
            set: {
              hasScore: true,
            },
          });
      }

      return result;
    });
  } catch (error) {
    console.error("Failed to persist score results", {
      serviceId,
      error,
    });

    throw error;
  }
}
