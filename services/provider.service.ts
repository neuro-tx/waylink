import { db } from "@/db";
import { products, productStats, providers } from "@/db/schemas";
import { BusinessType, Limitation, ProviderStatus } from "@/lib/all-types";
import { count, getTableColumns, sql, and, eq, or, ilike } from "drizzle-orm";

type ProviderService = "transport" | "accommodation" | "experience";

interface GetProvidersParams {
  search?: string;
  type?: ProviderService;
  limits: Limitation;
  status?: ProviderStatus;
  businessType?: BusinessType;
}

const getProviders = async ({
  search,
  type,
  limits,
  status,
  businessType,
}: GetProvidersParams) => {
  const { ...provider } = getTableColumns(providers);
  const { limit, offset } = limits;

  const filters = and(
    status ? eq(providers.status, status): undefined,
    businessType ? eq(providers.businessType, businessType) : undefined,
    type ? eq(providers.serviceType, type) : undefined,
    search
      ? or(
          ilike(providers.name, `%${search}%`),
          ilike(providers.description, `%${search}%`),
        )
      : undefined,
  );

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
    .where(filters)
    .groupBy(providers.id)
    .orderBy(sql`COALESCE(SUM(${productStats.bookingsCount}), 0) DESC`)
    .limit(limit)
    .offset(offset);

  return data;
};

export const providerService = { getProviders };
