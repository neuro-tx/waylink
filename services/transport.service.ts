import { db } from "@/db";
import {
  location,
  products,
  productScores,
  productStats,
  providers,
  transports,
} from "@/db/schemas";
import { Location, Provider } from "@/lib/all-types";
import { parseQuery } from "@/lib/query_parser/analyzer";
import {
  buildOrderBy,
  buildSearchQuery,
  buildWhereConditions,
  mergeWhere,
} from "@/lib/query_parser/helpers";
import { desc, eq, getTableColumns, sql } from "drizzle-orm";

const featuredTransports = async (limit: number, offset: number) => {
  const { searchVector, ...productColumns } = getTableColumns(products);

  const locationSub = db
    .select({
      productId: location.productId,
      locations: sql<Location[]>`json_agg(to_jsonb(${location}))`.as(
        "locations",
      ),
    })
    .from(location)
    .groupBy(location.productId)
    .as("locations_sub");

  const res = await db
    .select({
      ...productColumns,
      transportType: transports.transportType,
      class: transports.transportClass,
      directRoute: transports.hasDirectRoute,
      reviews: productStats.reviewsCount,
      bookings: productStats.bookingsCount,
      avgRating: productStats.averageRating,
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
    .innerJoin(transports, eq(products.id, transports.productId))
    .innerJoin(providers, eq(products.providerId, providers.id))
    .leftJoin(productStats, eq(products.id, productStats.productId))
    .leftJoin(locationSub, eq(products.id, locationSub.productId))
    .orderBy(
      desc(productScores.finalScore),
      desc(productStats.averageRating),
      desc(productStats.bookingsCount),
    )
    .limit(limit)
    .offset(offset);

  return res;
};

const getTransportWithUrl = async (url: string) => {
  const { query } = parseQuery(url);

  const limit = Number(query?.limit ?? 1);
  const offset = Number(query?.offset ?? 10);

  const mainConditions = buildWhereConditions(query?.where ?? {}, products);
  const transportSQL = buildWhereConditions(query?.where ?? {}, transports);
  const providerSQL = buildWhereConditions(query?.where ?? {}, providers);
  const searchSQl = buildSearchQuery(
    products.searchVector,
    query?.search?.term,
    "fts",
  );
  const final = mergeWhere(
    mainConditions,
    transportSQL,
    providerSQL,
    searchSQl,
  );

  const orderBy1 = buildOrderBy(query?.orderBy ?? [], products);
  const orderBy2 = buildOrderBy(query?.orderBy ?? [], productStats);
  const mainOrder = [...orderBy1, ...orderBy2];

  const locationSub = db
    .select({
      productId: location.productId,
      locations: sql<Location[]>`json_agg(to_jsonb(${location}))`.as(
        "locations",
      ),
    })
    .from(location)
    .groupBy(location.productId)
    .as("locations_sub");

  const [{ total }] = await db
    .select({ total: sql<number>`count(distinct ${products.id})` })
    .from(products)
    .innerJoin(productScores, eq(products.id, productScores.productId))
    .innerJoin(transports, eq(products.id, transports.productId))
    .innerJoin(providers, eq(products.providerId, providers.id))
    .leftJoin(productStats, eq(products.id, productStats.productId))
    .leftJoin(locationSub, eq(products.id, locationSub.productId))
    .where(final);

  const { searchVector, ...product } = getTableColumns(products);
  const result = await db
    .select({
      ...product,
      transportType: transports.transportType,
      class: transports.transportClass,
      directRoute: transports.hasDirectRoute,
      reviews: productStats.reviewsCount,
      bookings: productStats.bookingsCount,
      avgRating: productStats.averageRating,
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
    .innerJoin(transports, eq(products.id, transports.productId))
    .innerJoin(providers, eq(products.providerId, providers.id))
    .leftJoin(productStats, eq(products.id, productStats.productId))
    .leftJoin(locationSub, eq(products.id, locationSub.productId))
    .where(final)
    .orderBy(...mainOrder)
    .limit(limit)
    .offset(offset);

  return {
    data: result,
    pagination: {
      total,
      limit,
      offset,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(total / limit),
      hasNextPage: offset + limit < total,
      hasPrevPage: offset > 0,
    },
  };
};

export const transportService = { featuredTransports, getTransportWithUrl };
