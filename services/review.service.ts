import { db } from "@/db";
import {
  bookings,
  productReviews,
  products,
  productStats,
  user,
} from "@/db/schemas";
import { Pagination } from "@/lib/all-types";
import { and, eq, sql, count, desc, asc } from "drizzle-orm";

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

export type ReviewSortOption = "newest" | "oldest" | "highest" | "lowest";

interface GetProviderReviewsParams {
  providerId: string;
  page?: number;
  limit?: number;
  productId?: string | null;
  rating?: number | null;
  sort?: ReviewSortOption;
}

const sortMap: Record<
  ReviewSortOption,
  Parameters<typeof db.select>[0] extends infer T ? any : any
> = {
  newest: desc(productReviews.createdAt),
  oldest: asc(productReviews.createdAt),
  highest: desc(productReviews.rating),
  lowest: asc(productReviews.rating),
};

const getProviderReviews = async ({
  providerId,
  page = 1,
  limit = 10,
  productId = null,
  rating = null,
  sort = "newest",
}: GetProviderReviewsParams) => {
  const offset = (page - 1) * limit;

  const baseConditions = [eq(products.providerId, providerId)];
  if (productId) baseConditions.push(eq(productReviews.productId, productId));
  if (rating) baseConditions.push(eq(productReviews.rating, rating));

  const where = and(...baseConditions);

  let product: { id: string; title: string } | null = null;

  if (productId) {
    const targetProduct = await db
      .select({
        id: products.id,
        title: products.title,
      })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!targetProduct.length) throw new Error("product not found");

    product = targetProduct[0];
  }

  const [reviews, [stats], [{ total }]] = await Promise.all([
    db
      .select({
        id: productReviews.id,
        productId: productReviews.productId,
        userId: productReviews.userId,
        rating: productReviews.rating,
        comment: productReviews.comment,
        isVerified: productReviews.isVerified,
        providerResponse: productReviews.providerResponse,
        respondedAt: productReviews.respondedAt,
        createdAt: productReviews.createdAt,
        updatedAt: productReviews.updatedAt,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
      })
      .from(productReviews)
      .innerJoin(products, eq(productReviews.productId, products.id))
      .leftJoin(user, eq(productReviews.userId, user.id))
      .where(where)
      .orderBy(sortMap[sort])
      .limit(limit)
      .offset(offset),

    db
      .select({
        totalReviews: sql<number>`count(${productReviews.id})`,
        avgRating: sql<string>`
          coalesce(
            to_char(round(avg(${productReviews.rating})::numeric, 1), 'FM999999990.0'),
            '0.0'
          )`,
        fiveStar: sql<number>`count(*) filter (where ${productReviews.rating} = 5)`,
        fourStar: sql<number>`count(*) filter (where ${productReviews.rating} = 4)`,
        threeStar: sql<number>`count(*) filter (where ${productReviews.rating} = 3)`,
        twoStar: sql<number>`count(*) filter (where ${productReviews.rating} = 2)`,
        oneStar: sql<number>`count(*) filter (where ${productReviews.rating} = 1)`,
        totalServices: sql<number>`count(distinct ${products.id})`,
      })
      .from(products)
      .leftJoin(productReviews, eq(productReviews.productId, products.id))
      .where(eq(products.providerId, providerId)),

    db
      .select({ total: count() })
      .from(productReviews)
      .innerJoin(products, eq(productReviews.productId, products.id))
      .where(where),
  ]);

  const totalNum = Number(total);
  const totalPages = Math.ceil(totalNum / limit) || 1;

  const pagination: Pagination = {
    total: totalNum,
    limit,
    offset,
    page,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };

  return {
    reviews,
    stats: {
      ...stats,
      totalReviews: Number(stats.totalReviews),
      totalServices: Number(stats.totalServices),
      fiveStar: Number(stats.fiveStar),
      fourStar: Number(stats.fourStar),
      threeStar: Number(stats.threeStar),
      twoStar: Number(stats.twoStar),
      oneStar: Number(stats.oneStar),
    },
    pagination,
    product,
  };
};

export const reviewService = { createReview, getProviderReviews };
