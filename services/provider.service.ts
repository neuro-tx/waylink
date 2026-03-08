import { db } from "@/db";
import { products, productStats, providers } from "@/db/schemas";
import { parseQuery } from "@/lib/query_parser/analyzer";
import {
  buildSearchQuery,
  buildWhereConditions,
  mergeWhere,
} from "@/lib/query_parser/helpers";
import { count, getTableColumns, sql, eq } from "drizzle-orm";

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

export const providerService = { getProviders };
