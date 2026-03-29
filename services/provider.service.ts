import { db } from "@/db";
import {
  productReviews,
  products,
  productStats,
  providers,
  user,
} from "@/db/schemas";
import { parseQuery } from "@/lib/query_parser/analyzer";
import {
  buildSearchQuery,
  buildWhereConditions,
  mergeWhere,
} from "@/lib/query_parser/helpers";
import {
  count,
  getTableColumns,
  sql,
  eq,
  desc,
  and,
  inArray,
  not,
} from "drizzle-orm";

const getProviders = async (url: string) => {
  const { query } = parseQuery(url);
  const limit = Number(query?.limit ?? 10);
  const offset = Number(query?.offset ?? 0);

  const providerSQL = buildWhereConditions(query?.where ?? {}, providers);
  const searchSQL = buildSearchQuery(
    providers.description,
    query?.search?.term,
    "ilike",
  );
  const final = mergeWhere(providerSQL, searchSQL);

  const { ...provider } = getTableColumns(providers);

  const [countRes, list] = await Promise.all([
    db
      .select({ total: sql<number>`count(*)` })
      .from(providers)
      .innerJoin(products, eq(providers.id, products.providerId))
      .leftJoin(productStats, eq(products.id, productStats.productId))
      .where(final),
    db
      .select({
        ...provider,
        totalProducts: count(products.id),
        totalBookings: sql<number>`COALESCE(SUM(${productStats.bookingsCount}), 0)`,
        avgRating: sql<number>`COALESCE(ROUND(AVG(${productStats.averageRating})::numeric, 2), 0)`,
        totalReviews: sql<number>`COALESCE(SUM(${productStats.reviewsCount}), 0)`,
      })
      .from(providers)
      .leftJoin(products, eq(providers.id, products.providerId))
      .leftJoin(productStats, eq(products.id, productStats.productId))
      .where(final)
      .groupBy(providers.id)
      .orderBy(sql`COALESCE(SUM(${productStats.bookingsCount}), 0) DESC`)
      .limit(limit)
      .offset(offset),
  ]);

  const total = Number(countRes[0]?.total ?? 0);
  const pagination = {
    total,
    limit,
    offset,
    page: Math.floor(offset / limit) + 1,
    totalPages: Math.ceil(total / limit),
    hasNextPage: offset + limit < total,
    hasPrevPage: offset > 0,
  };

  return {
    data: list,
    pagination,
  };
};

const getProviderById = async (providerId: string) => {
  const provider = await db.query.providers.findFirst({
    where: (provider, { eq }) => eq(provider.id, providerId),
  });

  if (!provider) return null;
  return provider;
};

const providerReviewState = async (providerId: string) => {
  const [reviews, [stats]] = await Promise.all([
    db
      .select({
        id: productReviews.id,
        authorName: user.name,
        authorImage: user.image,
        rating: productReviews.rating,
        body: productReviews.comment,
        createdAt: productReviews.createdAt,
      })
      .from(productReviews)
      .innerJoin(products, eq(productReviews.productId, products.id))
      .leftJoin(user, eq(productReviews.userId, user.id))
      .where(eq(products.providerId, providerId))
      .orderBy(desc(productReviews.createdAt))
      .limit(5),

    db
      .select({
        totalReviews: sql<number>`count(${productReviews.id})`,
        totalServices: sql<number>`count(distinct ${products.id})`,
        avgRating: sql<string>`
        coalesce(
          to_char(round(avg(${productReviews.rating})::numeric, 1), 'FM999999990.0'),
          '0.0')`,
        fiveStar: sql<number>`count(*) filter (where ${productReviews.rating} = 5)`,
        fourStar: sql<number>`count(*) filter (where ${productReviews.rating} = 4)`,
        threeStar: sql<number>`count(*) filter (where ${productReviews.rating} = 3)`,
        twoStar: sql<number>`count(*) filter (where ${productReviews.rating} = 2)`,
        oneStar: sql<number>`count(*) filter (where ${productReviews.rating} = 1)`,
      })
      .from(products)
      .leftJoin(productReviews, eq(productReviews.productId, products.id))
      .where(eq(products.providerId, providerId)),
  ]);

  return {
    reviews,
    stats,
  };
};

const getProviderProducts = async (
  providerId: string,
  specialState: boolean,
  limit: number,
  page: number,
) => {
  const offset = (page - 1) * limit;
  const whereClause = specialState
    ? eq(products.providerId, providerId)
    : and(
        eq(products.providerId, providerId),
        not(inArray(products.status, ["draft", "paused"])),
      );

  const [countResult, items] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(whereClause),
    db
      .select()
      .from(products)
      .where(whereClause)
      .orderBy(products.createdAt)
      .limit(limit)
      .offset(offset),
  ]);

  const total = Number(countResult?.[0]?.count ?? 0);
  const pagination = {
    total,
    limit,
    offset,
    page: Math.floor(offset / limit) + 1,
    totalPages: Math.ceil(total / limit),
    hasNextPage: offset + limit < total,
    hasPrevPage: offset > 0,
  };

  return {
    items,
    pagination,
  };
};

export const providerService = {
  getProviders,
  providerReviewState,
  getProviderById,
  getProviderProducts,
};
