import { db } from "@/db";
import { bookings, productReviews, productStats } from "@/db/schemas";
import { and, eq, sql } from "drizzle-orm";

const createReview = async (
  userId: string,
  productId: string,
  comment: string,
  rating: number,
) => {
  // ✅ UX check (fast feedback)
  const existing = await db
    .select({ id: productReviews.id })
    .from(productReviews)
    .where(
      and(
        eq(productReviews.productId, productId),
        eq(productReviews.userId, userId),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    throw new Error("You already reviewed this product");
  }

  try {
    await db.transaction(async (tx) => {
      const check = await tx
        .select({ id: bookings.id })
        .from(bookings)
        .where(
          and(eq(bookings.userId, userId), eq(bookings.productId, productId)),
        )
        .limit(1);

      const isBooked = check.length > 0;

      await tx.insert(productReviews).values({
        productId,
        userId,
        rating,
        comment,
        isVerified: isBooked,
      });

      await tx
        .update(productStats)
        .set({
          lastReviewedAt: new Date(),
          reviewsCount: sql`${productStats.reviewsCount} + 1`,
        })
        .where(eq(productStats.productId, productId));
    });
  } catch (error: any) {
    if (error?.code === "23505") {
      throw new Error("You already reviewed this product");
    }

    throw error;
  }
};

export const reviewService = { createReview };
