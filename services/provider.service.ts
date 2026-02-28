import { db } from "@/db";
import { products, productStats, providers } from "@/db/schemas";
import { count, getTableColumns, sql, and, eq, or, ilike } from "drizzle-orm";

type ProviderService = "transport" | "accommodation" | "experience";

const getProviders = async (
  search: string | undefined,
  type: ProviderService,
) => {
  const { ...provider } = getTableColumns(providers);
  const data = await db
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
    .where(
      and(
        eq(providers.status, "approved"),
        search
          ? or(
              ilike(providers.name, `%${search}%`),
              ilike(providers.description, `%${search}%`),
            )
          : undefined,
        type ? eq(providers.serviceType, type) : undefined,
      ),
    )
    .groupBy(providers.id)
    .orderBy(sql`COALESCE(SUM(${productStats.bookingsCount}), 0) DESC`);

  return data;
};

export const providerService = { getProviders };
