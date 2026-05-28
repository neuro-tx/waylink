import {
  generateScore,
  getLowestPrice,
  getPriorityBoost,
  getServiceStats,
} from "@/lib/score-calc";
import { inngest } from "../client";
import { db } from "@/db";
import { productScores } from "@/db/schemas";
import { eq } from "drizzle-orm";

const computeScore = inngest.createFunction(
  {
    id: "compute-score",
    triggers: { event: "app/product.compute" },
  },
  async ({ event, step }) => {
    const { serviceId, providerId } = event.data;

    const scoreData = await step.run("get-score-data", async () => {
      const [stats, lowestPrice, priorityBoost] = await Promise.all([
        getServiceStats(serviceId),
        getLowestPrice(serviceId),
        getPriorityBoost(providerId),
      ]);

      return {
        stats,
        lowestPrice,
        priorityBoost,
      };
    });

    if (!scoreData.stats) {
      throw new Error("Service stats not found");
    }

    const score = generateScore({
      averageRating: scoreData.stats.averageRating,
      bookingsCount: scoreData.stats.bookingsCount,
      cancelledBookingsCount: scoreData.stats.cancelledBookingsCount,
      completedBookingsCount: scoreData.stats.completedBookingsCount,
      lastBookedAt: scoreData.stats.lastBookedAt,
      lowestPrice: scoreData.lowestPrice,
      priorityBoost: scoreData.priorityBoost,
      reviewsCount: scoreData.stats.reviewsCount,
    });

    await step.run("update-service-score", async () => {
      await db
        .update(productScores)
        .set({
          popularityScore: score.popularity,
          priceScore: score.price,
          ratingScore: score.rating,
          finalScore: score.finalScore,
          computedAt: new Date(),
        })
        .where(eq(productScores.productId, serviceId));
    });

    return {
      success: true,
      serviceId,
      score,
    };
  },
);

export const scoreFns = [computeScore];
