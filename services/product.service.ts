import { db } from "@/db";
import {
  bookingItems,
  bookings,
  experiences,
  location,
  productMedia,
  productReviews,
  products,
  productScores,
  productStats,
  productVariants,
  providers,
  transports,
  wishlistItems,
} from "@/db/schemas";
import { parseQuery } from "@/lib/query_parser/analyzer";
import {
  buildOrderBy,
  buildSearchQuery,
  buildWhereConditions,
  mergeWhere,
} from "@/lib/query_parser/helpers";
import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  InferSelectModel,
  sql,
} from "drizzle-orm";

type Location = InferSelectModel<typeof location>;
type Media = InferSelectModel<typeof productMedia>;
type Provider = InferSelectModel<typeof providers>;
type Servicetype = "experience" | "transport";

const getProducts = async (
  type: Servicetype,
  limit: number,
  page: number,
  provider?: boolean,
  loc?: boolean,
) => {
  const offset = (page - 1) * limit;
  const whereCondition = type ? eq(products.type, type) : undefined;
  const { searchVector, ...productColumns } = getTableColumns(products);

  const base = db
    .select({
      ...productColumns,
      finalScore: productScores.finalScore,
    })
    .from(products)
    .innerJoin(productScores, eq(products.id, productScores.productId))
    .where(whereCondition)
    .orderBy(desc(productScores.finalScore))
    .limit(limit)
    .offset(offset)
    .as("base");

  const mediaSub = db
    .select({
      productId: productMedia.productId,
      media: sql<Media[]>`json_agg(to_jsonb(${productMedia}))`.as("media"),
    })
    .from(productMedia)
    .groupBy(productMedia.productId)
    .as("media_sub");

  const selectFields: any = {
    ...base._.selectedFields,
    media: mediaSub.media,
  };

  let locationsSub;
  let providerSub;

  if (loc) {
    locationsSub = db
      .select({
        productId: location.productId,
        locations: sql<Location[]>`json_agg(to_jsonb(${location}))`.as(
          "locations",
        ),
      })
      .from(location)
      .groupBy(location.productId)
      .as("locations_sub");

    selectFields.locations = locationsSub.locations;
  }

  if (provider) {
    providerSub = db
      .select({
        id: providers.id,
        provider: sql<Provider>`to_jsonb(${providers})`.as("provider"),
      })
      .from(providers)
      .as("provider_sub");

    selectFields.provider = providerSub.provider;
  }

  let query = db
    .select(selectFields)
    .from(base)
    .leftJoin(mediaSub, eq(base.id, mediaSub.productId));

  if (loc && locationsSub) {
    query = query.leftJoin(locationsSub, eq(base.id, locationsSub.productId));
  }

  if (provider && providerSub) {
    query = query.leftJoin(providerSub, eq(base.providerId, providerSub.id));
  }

  return await query;
};

const featuredProducts = async (
  type: Servicetype,
  limit: number,
  page: number,
) => {
  const offset = (page - 1) * limit;
  const { searchVector, ...productColumns } = getTableColumns(products);
  const whereCondition = type ? eq(products.type, type) : undefined;

  const mediaSub = db
    .select({
      productId: productMedia.productId,
      media: sql<Media[]>`json_agg(to_jsonb(${productMedia}))`.as("media"),
    })
    .from(productMedia)
    .groupBy(productMedia.productId)
    .as("media_sub");

  const locationsSub = db
    .select({
      productId: location.productId,
      locations: sql<Location[]>`json_agg(to_jsonb(${location}))`.as(
        "locations",
      ),
    })
    .from(location)
    .groupBy(location.productId)
    .as("locations_sub");

  const providerSub = db
    .select({
      id: providers.id,
      provider: sql<Provider>`
      json_build_object(
        'id', ${providers.id},
        'name', ${providers.name},
        'logo', ${providers.logo},
        'is_verified', ${providers.isVerified}
      )
    `.as("provider"),
    })
    .from(providers)
    .as("provider_sub");

  const featuredProds = await db
    .select({
      ...productColumns,
      reviews: productStats.reviewsCount,
      bookings: productStats.bookingsCount,
      avgRate: productStats.averageRating,
      media: mediaSub.media,
      locations: locationsSub.locations,
      provider: providerSub.provider,
    })
    .from(products)
    .innerJoin(productScores, eq(products.id, productScores.productId))
    .leftJoin(productStats, eq(products.id, productStats.productId))
    .leftJoin(mediaSub, eq(products.id, mediaSub.productId))
    .leftJoin(locationsSub, eq(products.id, locationsSub.productId))
    .leftJoin(providerSub, eq(products.providerId, providerSub.id))
    .where(whereCondition)
    .orderBy(desc(productScores.finalScore))
    .limit(limit)
    .offset(offset);

  return featuredProds;
};

const mostRatedProducts = async (url: string) => {
  const { query } = parseQuery(url);

  const limit = Math.min(Number(query?.limit ?? 10), 50);
  const offset = Number(query?.offset ?? 0);

  const whereSQl = buildWhereConditions(query?.where ?? {}, products);
  const searchSQl = buildSearchQuery(
    products.searchVector,
    query?.search?.term,
    "fts",
  );

  const final = mergeWhere(whereSQl, searchSQl);

  const mainOrder = buildOrderBy(query?.orderBy ?? [], products);

  const baseWhere = and(
    eq(products.status, "active"),
    eq(providers.isVerified, true),
    final,
  );

  const locationSub = db
    .select({
      productId: location.productId,
      locations: sql<Location[]>`
          coalesce(
            json_agg(to_jsonb(${location})),
            '[]'::json
          )
      `.as("locations"),
    })
    .from(location)
    .groupBy(location.productId)
    .as("locations_sub");

  const mediaSub = db
    .select({
      productId: productMedia.productId,
      media: sql<Media[]>`
      coalesce(
        json_agg(to_jsonb(${productMedia})),
        '[]'::json
      )
      `.as("media"),
    })
    .from(productMedia)
    .groupBy(productMedia.productId)
    .as("media_sub");

  const rankingScore = sql`
    (
      (COALESCE(${productStats.averageRating},0) * 0.6) +
      (COALESCE(${productStats.reviewsCount},0) * 0.2) +
      (COALESCE(${productStats.bookingsCount},0) * 0.2)
    )
  `;

  const { searchVector, ...product } = getTableColumns(products);
  const main = db
    .select({
      ...product,
      reviews: productStats.reviewsCount,
      bookings: productStats.bookingsCount,
      avgRate: productStats.averageRating,
      media: mediaSub.media,
      locations: locationSub.locations,
      provider: sql<Pick<Provider, "id" | "name" | "logo" | "isVerified">>`
        json_build_object(
          'id', ${providers.id},
          'name', ${providers.name},
          'logo', ${providers.logo},
          'isVerified', ${providers.isVerified}
        )
      `,
    })
    .from(products)
    .innerJoin(productScores, eq(products.id, productScores.productId))
    .leftJoin(productStats, eq(products.id, productStats.productId))
    .innerJoin(providers, eq(products.providerId, providers.id))
    .leftJoin(locationSub, eq(products.id, locationSub.productId))
    .leftJoin(mediaSub, eq(products.id, mediaSub.productId))
    .where(baseWhere)
    .orderBy(desc(rankingScore), ...mainOrder)
    .limit(limit)
    .offset(offset);

  const count = db
    .select({
      total: sql<number>`count(*)`,
    })
    .from(products)
    .innerJoin(providers, eq(products.providerId, providers.id))
    .where(baseWhere);

  const [data, totalResult] = await Promise.all([main, count]);

  const total = Number(totalResult[0]?.total ?? 0);
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
    data,
    pagination,
  };
};

const getProductById = async (id: string) => {
  const product = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: {
      variants: {
        with: {
          transportSchedules: true,
        },
      },
    },
    columns: {
      searchVector: false,
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  const [media, locations, provider, reviews, stats, experince, transport] =
    await Promise.all([
      db.query.productMedia.findMany({
        where: eq(productMedia.productId, id),
      }),
      db.query.location.findMany({
        where: eq(location.productId, id),
      }),
      db.query.providers.findFirst({
        where: eq(providers.id, product.providerId),
        columns: {
          id: true,
          name: true,
          logo: true,
          isVerified: true,
        },
      }),
      db.query.productReviews.findMany({
        where: eq(sql`${productReviews.productId}`, id),
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        limit: 5,
      }),
      db.query.productStats.findFirst({
        where: eq(productStats.productId, id),
        columns: {
          averageRating: true,
          bookingsCount: true,
          reviewsCount: true,
        },
      }),
      db.query.experiences.findFirst({
        where: eq(sql`${product.id}`, sql`${experiences.productId}`),
        with: {
          itineraries: true,
        },
      }),
      db.query.transports.findFirst({
        where: eq(sql`${product.id}`, sql`${transports.productId}`),
      }),
    ]);

  return {
    ...product,
    media,
    locations,
    provider,
    reviews,
    stats,
    experince,
    transport,
  };
};

const getProductsSearch = async (url: string) => {
  const { query } = parseQuery(url);

  const whereSQl = buildWhereConditions(query?.where ?? {}, products);
  const searchSQl = buildSearchQuery(
    products.searchVector,
    query?.search?.term,
    "fts",
  );

  const final = mergeWhere(whereSQl, searchSQl);

  const { searchVector, ...product } = getTableColumns(products);
  const result = await db
    .select({ ...product })
    .from(products)
    .where(final)
    .limit(10);

  return result;
};

const getServiceAnalytics = async (providerId: string, id: string) => {
  const [service] = await db
    .select({
      id: products.id,
      providerId: products.providerId,
    })
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  if (!service) throw new Error("Service not found.");
  if (service.providerId !== providerId)
    throw new Error("You do not have permission to access this service.");

  const [
    [stats],
    [score],
    [wishListCount],
    variantsTable,
    bookingStatusBreakdown,
    passengerBreakDown,
    recentBookings,
    monthlyTrends,
  ] = await Promise.all([
    db
      .select()
      .from(productStats)
      .where(eq(productStats.productId, id))
      .limit(1),

    db
      .select()
      .from(productScores)
      .where(eq(productScores.productId, id))
      .limit(1),

    db
      .select({ total: count() })
      .from(wishlistItems)
      .where(eq(wishlistItems.itemId, id)),

    db
      .select({
        varId: productVariants.id,
        name: productVariants.name,
        status: productVariants.status,
        capacity: productVariants.capacity,
        adultPrice: productVariants.adultPrice,
        childPrice: productVariants.childPrice,
        infantPrice: productVariants.infantPrice,
        bookingsCount: count(bookings.id),
        totalParticipantsCount: sql<number>`coalesce(sum(${bookings.participantsCount}), 0)`,
        revenue: sql<number>`coalesce(sum(
          case
            when ${bookings.status} in ('completed','confirmed')
            then ${bookings.totalAmount}
            else 0
          end
        ),0)`,
      })
      .from(productVariants)
      .leftJoin(
        bookings,
        and(
          eq(bookings.variantId, productVariants.id),
          eq(bookings.productId, id),
        ),
      )
      .where(eq(productVariants.productId, id))
      .groupBy(productVariants.id),

    db
      .select({
        status: bookings.status,
        count: count(),
        percentage: sql<number>`round(count(*) * 100.0 / sum(count(*)) over (), 1)::float`,
      })
      .from(bookings)
      .where(eq(bookings.productId, id))
      .groupBy(bookings.status),

    db
      .select({
        passengerType: bookingItems.passengerType,
        count: sql<number>`coalesce(sum(${bookingItems.quantity}), 0)`,
      })
      .from(bookings)
      .innerJoin(bookingItems, eq(bookingItems.bookingId, bookings.id))
      .where(eq(bookings.productId, id))
      .groupBy(bookingItems.passengerType),

    db
      .select({
        id: bookings.id,
        status: bookings.status,
        totalAmount: bookings.totalAmount,
        participantsCount: bookings.participantsCount,
        createdAt: bookings.createdAt,
        variantName: productVariants.name,
        customerId: bookings.userId,
      })
      .from(bookings)
      .leftJoin(productVariants, eq(productVariants.id, bookings.variantId))
      .where(eq(bookings.productId, id))
      .orderBy(desc(bookings.createdAt))
      .limit(10),

    db
      .select({
        monthNumber: sql<number>`extract(month from ${bookings.createdAt})::int`,
        monthName: sql<string>`to_char(${bookings.createdAt}, 'Mon')`,
        bookingsCount: count(bookings.id),
        revenue: sql<number>`coalesce(sum(
          case when ${bookings.status} in ('completed','confirmed')
               then ${bookings.totalAmount} else 0 end
        ), 0)`,
      })
      .from(bookings)
      .where(eq(bookings.productId, id))
      .groupBy(
        sql`extract(month from ${bookings.createdAt})`,
        sql`to_char(${bookings.createdAt}, 'Mon')`,
      )
      .orderBy(sql`extract(month from ${bookings.createdAt})`),
  ]);

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const fullSeries = Array.from({ length: 12 }, (_, i) => {
    const monthNumber = i + 1;
    const found = monthlyTrends.find((m) => m.monthNumber === monthNumber);

    return (
      found ?? {
        monthNumber,
        monthName: months[i],
        bookingsCount: 0,
        revenue: 0,
      }
    );
  });

  return {
    stats,
    score,
    wishListCount: wishListCount.total,
    variants: variantsTable,
    bookingStatusBreakdown,
    passengerBreakDown,
    recentBookings,
    monthlyTrends: fullSeries,
  };
};

export const productSerices = {
  getProducts,
  getProductById,
  featuredProducts,
  mostRatedProducts,
  getProductsSearch,
  getServiceAnalytics,
};
