import {
  generateScore,
  getLowestPrice,
  getPriorityBoost,
  getServiceStats,
  persistScoreResults,
} from "@/lib/score-calc";
import { inngest } from "../client";
import { cron } from "inngest";
import { db } from "@/db";
import pLimit from "p-limit";

const computeScore = inngest.createFunction(
  {
    id: "compute-score",
    triggers: { event: "app/product.compute" },
  },
  async ({ event, step }) => {
    const { serviceId, providerId, updateProgress } = event.data;

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
      return persistScoreResults({
        serviceId,
        updateProgress: Boolean(updateProgress),
        scores: score,
      });
    });

    return {
      success: true,
      serviceId,
      score,
    };
  },
);

export const recomputeAllProductsCron = inngest.createFunction(
  {
    id: "recompute-all-products-cron",
    triggers: [cron("0 3,15 * * *")],
  },
  async ({ step }) => {
    const allProducts = await step.run("fetch-products", async () => {
      return db.query.products.findMany({
        columns: {
          id: true,
          providerId: true,
        },
      });
    });
    if (!allProducts.length) {
      return {
        success: true,
        queued: 0,
      };
    }

    const limit = pLimit(50);

    let queued = 0;
    await Promise.all(
      allProducts.map((product) =>
        limit(async () => {
          await inngest.send({
            name: "app/product.compute",
            data: {
              serviceId: product.id,
              providerId: product.providerId,
              updateProgress: false,
            },
          });

          queued++;
        }),
      ),
    );

    return {
      success: true,
      queued,
    };
  },
);

export const scoreFns = [computeScore, recomputeAllProductsCron];
