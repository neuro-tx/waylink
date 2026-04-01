import { db } from "@/db";
import {
  location,
  productMedia,
  products,
  productStats,
  providers,
  wishlistItems,
  wishlists,
} from "@/db/schemas";
import { Location, Media } from "@/lib/all-types";
import { count, eq, getTableColumns, sql } from "drizzle-orm";

async function getUserWishlists(userId: string) {
  if (!userId) throw new Error("User id is required.");

  const wishlistsWithCount = await db
    .select({
      id: wishlists.id,
      name: wishlists.name,
      description: wishlists.description,
      color: wishlists.color,
      isPrivate: wishlists.isPrivate,
      userId: wishlists.userId,
      createdAt: wishlists.createdAt,
      updatedAt: wishlists.updatedAt,
      totalItems: count(wishlistItems.id),
    })
    .from(wishlists)
    .leftJoin(wishlistItems, eq(wishlistItems.wishlistId, wishlists.id))
    .where(eq(wishlists.userId, userId))
    .groupBy(wishlists.id);

  return wishlistsWithCount;
}

async function getListItems(listId: string) {
  const { ...item } = getTableColumns(wishlistItems);
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

const getUserProvider = async(userId: string) => {
  const provider = await db.query.providers.findFirst({
    where: eq(providers.ownerId, userId),
  });

  return provider;
}

export const userService = { getUserWishlists, getListItems, getUserProvider };
