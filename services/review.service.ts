import { db } from "@/db";
import { bookings, productReviews, productStats } from "@/db/schemas";
import { and, eq, sql } from "drizzle-orm";

const createReview = async (
  userId: string,
  productId: string,
  comment: string,
  rating: number,
) => {
  await db.transaction(async (tx) => {
    const check = await tx
      .select()
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
};

export const reviewService = { createReview };
