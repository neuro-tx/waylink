import { db } from "@/db";
import {
  experiences,
  location,
  productMedia,
  productReviews,
  products,
  productScores,
  productStats,
  providers,
  transports,
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
          pricing: true,
          transportSchedule: true,
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

export const productSerices = {
  getProducts,
  getProductById,
  featuredProducts,
  mostRatedProducts,
};
