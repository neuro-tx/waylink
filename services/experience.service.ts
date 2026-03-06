import { db } from "@/db";
import {
  experiences,
  location,
  productMedia,
  products,
  productScores,
  productStats,
  providers,
} from "@/db/schemas";

import { parseQuery } from "@/lib/query_parser/analyzer";
import {
  buildOrderBy,
  buildSearchQuery,
  buildWhereConditions,
  mergeWhere,
} from "@/lib/query_parser/helpers";

import { Location, Media, Provider } from "@/lib/all-types";
import { eq, getTableColumns, sql, desc } from "drizzle-orm";

const getExperiences = async (url: string) => {
  const { query } = parseQuery(url);

  const limit = Number(query?.limit ?? 10);
  const offset = Number(query?.offset ?? 0);

  const productConditions = buildWhereConditions(query?.where ?? {}, products);
  const experienceConditions = buildWhereConditions(
    query?.where ?? {},
    experiences,
  );
  const searchCondition = buildSearchQuery(
    products.searchVector,
    query?.search?.term,
    "fts",
  );
  const whereClause = mergeWhere(
    productConditions,
    experienceConditions,
    searchCondition,
  );

  const productOrder = buildOrderBy(query?.orderBy ?? [], products);
  const experienceOrder = buildOrderBy(query?.orderBy ?? [], experiences);
  const finalOrder = [...productOrder, ...experienceOrder];

  const locationsSub = db
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

  const { searchVector, ...productColumns } = getTableColumns(products);

  const [countResult, experiencesList] = await Promise.all([
    db
      .select({
        total: sql<number>`count(*)`,
      })
      .from(experiences)
      .innerJoin(products, eq(products.id, experiences.productId))
      .where(whereClause),

    db
      .select({
        ...productColumns,

        reviews: productStats.reviewsCount,
        bookings: productStats.bookingsCount,
        avgRating: productStats.averageRating,
        score: productScores.finalScore,

        media: mediaSub.media,
        locations: locationsSub.locations,

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
      .innerJoin(experiences, eq(products.id, experiences.productId))
      .innerJoin(productScores, eq(products.id, productScores.productId))
      .innerJoin(providers, eq(products.providerId, providers.id))
      .leftJoin(productStats, eq(products.id, productStats.productId))
      .leftJoin(locationsSub, eq(products.id, locationsSub.productId))
      .leftJoin(mediaSub, eq(products.id, mediaSub.productId))
      .where(whereClause)
      .orderBy(
        ...(finalOrder.length
          ? finalOrder
          : [
              desc(productScores.finalScore),
              desc(productStats.averageRating),
              desc(productStats.bookingsCount),
            ]),
      )
      .limit(limit)
      .offset(offset),
  ]);

  const total = Number(countResult[0]?.total ?? 0);

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
    data: experiencesList,
    pagination,
  };
};

export const experienceServices = {
  getExperiences,
};
