import { db } from "@/db";
import {
  location,
  productMedia,
  products,
  productScores,
  providers,
} from "@/db/schemas";
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

const getProductById = async (id: string) => {
  const conditions = [eq(products.id, id)];

  const result = await db.query.products.findFirst({
    where: and(...conditions),

    with: {
      locations: true,
      media: true,
      provider: true,
      reviews: true,
      variants: {
        with: {
          pricing: true,
          transportSchedule: true,
        },
      },
      experience: true,
      transport: true,
    },
  });

  return result;
};

export const productSerices = { getProducts, getProductById };
