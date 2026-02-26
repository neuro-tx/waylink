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

export const transportService = { featuredTransports };
