import { db } from "@/db";
import {
  bookings,
  bookingItems,
  products,
  productVariants,
  user,
} from "@/db/schemas";
import {
  and,
  asc,
  desc,
  eq,
  ilike,
  inArray,
  or,
  sql,
  count,
  getTableColumns,
} from "drizzle-orm";
import type {
  BookingItem,
  BookingSortOption,
  GetBookingsParams,
} from "@/lib/panel-types";

const sortMap: Record<BookingSortOption, any> = {
  newest: desc(bookings.createdAt),
  oldest: asc(bookings.createdAt),
  highest_amount: desc(bookings.totalAmount),
  lowest_amount: asc(bookings.totalAmount),
  most_participants: desc(bookings.participantsCount),
};

export const getProviderBookings = async ({
  providerId,
  page = 1,
  limit = 10,
  status,
  productId,
  search,
  sort = "newest",
}: GetBookingsParams) => {
  const offset = (page - 1) * limit;

  const conditions: any[] = [eq(bookings.providerId, providerId)];
  if (status) conditions.push(eq(bookings.status, status));
  if (productId) conditions.push(eq(bookings.productId, productId));

  if (search) {
    conditions.push(
      or(
        ilike(user.name, `%${search}%`),
        ilike(user.email, `%${search}%`),
        ilike(bookings.orderNumber, `%${search}%`),
        ilike(products.title, `%${search}%`),
      ),
    );
  }

  const where = and(...conditions);

const [[stats], [{ total }], rows] = await Promise.all([
  db
    .select({
      total: count(),
      pending: sql<number>`count(*) filter (where ${bookings.status} = 'pending')`,
      confirmed: sql<number>`count(*) filter (where ${bookings.status} = 'confirmed')`,
      completed: sql<number>`count(*) filter (where ${bookings.status} = 'completed')`,
      cancelled: sql<number>`count(*) filter (where ${bookings.status} = 'cancelled')`,
      expired: sql<number>`count(*) filter (where ${bookings.status} = 'expired')`,
      totalRevenue: sql<number>`coalesce(sum(${bookings.totalAmount}) filter (where ${bookings.status} = 'completed'), 0)`,
      pendingRevenue: sql<number>`coalesce(sum(${bookings.totalAmount}) filter (where ${bookings.status} in ('pending','confirmed','completed')), 0)`,
      currency: sql<string>`mode() within group (order by ${bookings.currency})`,
    })
    .from(bookings)
    .where(eq(bookings.providerId, providerId)),

  db
    .select({ total: count() })
    .from(bookings)
    .innerJoin(products, eq(bookings.productId, products.id))
    .leftJoin(user, eq(bookings.userId, user.id))
    .where(where),

  db
    .select({
      ...getTableColumns(bookings),
      productTitle: products.title,

      variant_id: productVariants.id,
      variant_productId: productVariants.productId,
      variant_name: productVariants.name,
      variant_startDate: productVariants.startDate,
      variant_endDate: productVariants.endDate,
      variant_capacity: productVariants.capacity,
      variant_bookedCount: productVariants.bookedCount,
      variant_status: productVariants.status,
      variant_createdAt: productVariants.createdAt,
      variant_updatedAt: productVariants.updatedAt,

      u_id: user.id,
      u_name: user.name,
      u_email: user.email,
      u_image: user.image,
    })
    .from(bookings)
    .innerJoin(products, eq(bookings.productId, products.id))
    .innerJoin(productVariants, eq(bookings.variantId, productVariants.id))
    .leftJoin(user, eq(bookings.userId, user.id))
    .where(where)
    .orderBy(sortMap[sort])
    .limit(limit)
    .offset(offset),
]);

  const bookingIds = rows.map((r) => r.id);
  const items = bookingIds.length
    ? await db
        .select()
        .from(bookingItems)
        .where(inArray(bookingItems.bookingId, bookingIds))
    : [];

  const itemsMap = new Map<string, BookingItem[]>();

  for (const item of items) {
    const list = itemsMap.get(item.bookingId);

    const normalized = {
      id: item.id,
      passengerType: item.passengerType as BookingItem["passengerType"],
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice),
    };

    if (list) {
      list.push(normalized);
    } else {
      itemsMap.set(item.bookingId, [normalized]);
    }
  }

  // FINAL SHAPE
  const bookingsData = rows.map((r) => ({
    id: r.id,
    orderNumber: r.orderNumber,
    status: r.status,
    userId: r.userId,
    productId: r.productId,
    variantId: r.variantId,
    providerId: r.providerId,
    productTitle: r.productTitle,

    variant: {
      id: r.variant_id,
      productId: r.variant_productId,
      name: r.variant_name,
      startDate: r.variant_startDate,
      endDate: r.variant_endDate,
      capacity: Number(r.variant_capacity),
      bookedCount: Number(r.variant_bookedCount),
      status: r.variant_status,
      createdAt: r.variant_createdAt,
      updatedAt: r.variant_updatedAt,
    },

    user: {
      id: r.u_id,
      name: r.u_name,
      email: r.u_email,
      image: r.u_image,
    },

    totalAmount: Number(r.totalAmount),
    currency: r.currency,
    participantsCount: r.participantsCount,
    items: itemsMap.get(r.id) ?? [],

    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    canceledAt: r.canceledAt,
    completedAt: r.completedAt,
  }));

  const totalNum = Number(total);
  const totalPages = Math.ceil(totalNum / limit) || 1;

  return {
    bookings: bookingsData,
    stats: {
      total: Number(stats.total),
      pending: Number(stats.pending),
      confirmed: Number(stats.confirmed),
      completed: Number(stats.completed),
      cancelled: Number(stats.cancelled),
      expired: Number(stats.expired),
      totalRevenue: Number(stats.totalRevenue),
      pendingRevenue: Number(stats.pendingRevenue),
      currency: stats.currency ?? "USD",
    },
    pagination: {
      total: totalNum,
      limit,
      offset,
      page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};
