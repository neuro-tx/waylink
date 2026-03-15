import { db } from "@/db";
import {
  location,
  productMedia,
  products,
  productStats,
  wishlistItems,
} from "@/db/schemas";
import { Location, Media } from "@/lib/all-types";
import { eq, getTableColumns, sql } from "drizzle-orm";

async function getUserWishlists(userId: string) {
  if (!userId) throw new Error("User id is required.");

  const wishlists = await db.query.wishlists.findMany({
    where: (wishlists, { eq }) => eq(wishlists.userId, userId),
  });

  return wishlists;
}

async function getListItems(listId: string) {
  const {...item} = getTableColumns(wishlistItems);
  const itemsQuery = db
    .select({
      ...item,
      productId: wishlistItems.itemId,
      title: products.title,
      basePrice: products.basePrice,
      type: products.type,
      reviews: productStats.reviewsCount,
      bookings: productStats.bookingsCount,
      avgRate: productStats.averageRating,
      media: sql<Media[]>`coalesce(
        json_agg(distinct to_jsonb(${productMedia})) filter (where ${productMedia.id} is not null),
        '[]'::json
      )`,
      locations: sql<Location[]>`coalesce(
        json_agg(distinct to_jsonb(${location})) filter (where ${location.id} is not null),
        '[]'::json
      )`,
    })
    .from(wishlistItems)
    .leftJoin(products, eq(wishlistItems.itemId, products.id))
    .leftJoin(productStats, eq(products.id, productStats.productId))
    .leftJoin(productMedia, eq(products.id, productMedia.productId))
    .leftJoin(location, eq(products.id, location.productId))
    .where(eq(wishlistItems.wishlistId, listId))
    .groupBy(
      wishlistItems.id,
      wishlistItems.itemId,
      products.title,
      products.basePrice,
      products.type,
      productStats.reviewsCount,
      productStats.bookingsCount,
      productStats.averageRating,
    );

  const countQuery = db
    .select({ total: sql<number>`count(*)::int` })
    .from(wishlistItems)
    .where(eq(wishlistItems.wishlistId, listId));

  const [items, [{ total }]] = await Promise.all([itemsQuery, countQuery]);

  return { items, total };
}

export const userService = { getUserWishlists, getListItems };
