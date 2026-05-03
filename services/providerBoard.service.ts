import { db } from "@/db";
import {
  bookings,
  location,
  productMedia,
  products,
  productStats,
  providers,
  providerStats,
  user,
} from "@/db/schemas";
import { calculateGrowthMetric } from "@/lib/helpers";
import type {
  ProviderStats,
  LatestBooking,
  TopProduct,
  RevenueDataPoint,
  BookingStatusBreakdown,
  ProviderKPIs,
  DateRange,
} from "@/lib/panel-types";
import {
  and,
  between,
  desc,
  eq,
  sql,
  not,
  SQL,
  getTableColumns,
} from "drizzle-orm";

function getDateRange(range: DateRange): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date();

  const days: Record<DateRange, number> = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
    "1y": 365,
  };

  from.setDate(from.getDate() - days[range]);
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);

  return { from, to };
}
async function getProviderStats(providerId: string): Promise<ProviderStats> {
  try {
    const [row] = await db
      .select()
      .from(providerStats)
      .where(eq(providerStats.providerId, providerId));

    return row;
  } catch (error) {
    console.error("[ProviderService] getProviderStats:", error);
    throw error;
  }
}

async function getRecentBookings(
  providerId: string,
  limit = 10,
): Promise<LatestBooking[]> {
  try {
    return await db
      .select({
        id: bookings.id,
        createdAt: bookings.createdAt,
        customerName: user.name,
        image: user.image,
        amount: bookings.participantsCount,
        status: bookings.status,
      })
      .from(bookings)
      .innerJoin(user, eq(bookings.userId, user.id))
      .where(eq(bookings.providerId, providerId))
      .orderBy(desc(bookings.createdAt))
      .limit(limit);
  } catch (error) {
    console.error("[ProviderService] getRecentBookings:", error);
    throw error;
  }
}

async function getTopProducts(
  providerId: string,
  limit = 5,
): Promise<TopProduct[]> {
  try {
    return await db
      .select({
        id: products.id,
        name: products.title,
        revenue: sql<number>`coalesce(${productStats.totalRevenue}, 0)::float`,
        bookings: productStats.bookingsCount,
        avgRating: sql<number>`coalesce(${productStats.averageRating}, 0)::float`,
        lastBookingAt: productStats.lastBookedAt,
        avgOrders: sql<number>`coalesce(avg(${productStats.bookingsCount}), 0)`,
      })
      .from(products)
      .innerJoin(productStats, eq(products.id, productStats.productId))
      .where(eq(products.providerId, providerId))
      .groupBy(
        products.id,
        productStats.totalRevenue,
        productStats.averageRating,
        productStats.bookingsCount,
        productStats.lastBookedAt,
      )
      .limit(limit);
  } catch (error) {
    console.error("[ProviderService] getTopProducts:", error);
    throw error;
  }
}

async function getRevenueTimeSeries(
  providerId: string,
  range: DateRange,
): Promise<RevenueDataPoint[]> {
  const { from, to } = getDateRange(range);

  try {
    return await db
      .select({
        date: sql<string | Date>`date(${bookings.createdAt})`,
        revenue: sql<number>`coalesce(sum(${bookings.totalAmount}) ,0)::float`,
        bookings: sql<number>`count(${bookings.id})`,
      })
      .from(bookings)
      .where(
        and(
          eq(bookings.providerId, providerId),
          between(bookings.createdAt, from, to),
        ),
      )
      .groupBy(sql`date(${bookings.createdAt})`)
      .orderBy(sql`date(${bookings.createdAt})`);
  } catch (error) {
    console.error("[ProviderService] getRevenueTimeSeries:", error);
    throw error;
  }
}

async function getBookingStatusBreakdown(
  providerId: string,
): Promise<BookingStatusBreakdown[]> {
  try {
    return await db
      .select({
        status: bookings.status,
        count: sql<number>`count(*)`,
        percentage: sql<number>`round(count(*) * 100.0 / sum(count(*)) over (),1)::float`,
      })
      .from(bookings)
      .where(eq(bookings.providerId, providerId))
      .groupBy(bookings.status);
  } catch (error) {
    console.error("[ProviderService] getBookingStatusBreakdown:", error);
    throw error;
  }
}

async function getProviderKPIs(
  providerId: string,
  range: DateRange,
): Promise<ProviderKPIs> {
  const { from, to } = getDateRange(range);
  const diff = to.getTime() - from.getTime();
  const prevFrom = new Date(from.getTime() - diff);
  const prevTo = new Date(to.getTime() - diff);

  try {
    const subquery = db
      .select({
        customerId: bookings.userId,
        bookingCount: sql<number>`count(*)`.as("booking_count"),
      })
      .from(bookings)
      .where(
        and(
          eq(bookings.providerId, providerId),
          between(bookings.createdAt, from, to),
        ),
      )
      .groupBy(bookings.userId)
      .as("sub");

    const [currentResult, repeatResult, prevResult, cancellation] =
      await Promise.all([
        db
          .select({
            totalRevenue: sql<number>`coalesce(sum(${bookings.totalAmount}), 0)::float`,
            totalBookings: sql<number>`count(${bookings.id})`,
          })
          .from(bookings)
          .where(
            and(
              eq(bookings.providerId, providerId),
              between(bookings.createdAt, from, to),
            ),
          ),

        db
          .select({
            rate: sql<number>`coalesce(count(*) filter (where ${subquery.bookingCount} > 1) * 100.0 / nullif(count(*), 0), 0)::float`.as(
              "rate",
            ),
          })
          .from(subquery),

        db
          .select({
            totalRevenue: sql<number>`coalesce(sum(${bookings.totalAmount}), 0)::float`,
            totalBookings: sql<number>`count(${bookings.id})`,
          })
          .from(bookings)
          .where(
            and(
              eq(bookings.providerId, providerId),
              between(bookings.createdAt, prevFrom, prevTo),
            ),
          ),
        db
          .select({
            rate: sql<number>`COALESCE(COUNT(*) FILTER (WHERE status = 'cancelled') * 100.0/ NULLIF(COUNT(*), 0),0)::float`,
          })
          .from(bookings)
          .where(
            and(
              eq(bookings.providerId, providerId),
              between(bookings.createdAt, from, to),
            ),
          ),
      ]);

    const stats = currentResult[0];
    const repeatRateRaw = repeatResult[0]?.rate ?? 0;

    const currentRevenue = Number(stats.totalRevenue ?? 0);
    const prevRevenue = Number(prevResult[0].totalRevenue ?? 0);
    const currentBookings = Number(stats.totalBookings ?? 0);
    const prevBookings = Number(prevResult[0].totalBookings ?? 0);

    const avgRevenuePerBooking =
      stats.totalBookings > 0 ? stats.totalRevenue / stats.totalBookings : 0;

    const bookingGrowth = calculateGrowthMetric(currentBookings, prevBookings);
    const revenueGrowth = calculateGrowthMetric(currentRevenue, prevRevenue);
    const cancellationRate = Number(cancellation[0].rate.toFixed(1));

    return {
      avgRevenuePerBooking: Math.round(avgRevenuePerBooking),
      repeatCustomerRate: Number(Number(repeatRateRaw).toFixed(1)),
      cancellationRate,
      bookingGrowth,
      revenueGrowth,
    };
  } catch (error) {
    console.error("[ProviderService] getProviderKPIs:", error);
    throw error;
  }
}

async function getServices(
  providerId: string,
  whereClause: any,
  orderByClause: any,
  limitation?: { limit: number; offset: number },
) {
  const { limit = 20, offset = 0 } = limitation ?? {};
  const { searchVector, ...productColumns } = getTableColumns(products);

  const baseWhere = and(eq(products.providerId, providerId), whereClause);

  const [countResult, data] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(baseWhere),

    db
      .select({
        ...productColumns,
        media: sql`
          COALESCE(
            json_agg(DISTINCT ${productMedia})
            FILTER (WHERE ${productMedia.id} IS NOT NULL),
            '[]'
          )
        `.as("media"),
        locations: sql`
          COALESCE(
            json_agg(DISTINCT ${location})
            FILTER (WHERE ${location.id} IS NOT NULL),
            '[]'
          )
        `.as("locations"),
        provider: {
          id: providers.id,
          name: providers.name,
          logo: providers.logo,
          isVerified: providers.isVerified,
        },
        reviews: productStats.reviewsCount,
        bookings: productStats.bookingsCount,
        avgRate: productStats.averageRating,
      })
      .from(products)
      .innerJoin(productStats, eq(products.id, productStats.productId))
      .leftJoin(providers, eq(products.providerId, providers.id))
      .leftJoin(productMedia, eq(products.id, productMedia.productId))
      .leftJoin(location, eq(products.id, location.productId))
      .where(baseWhere)
      .groupBy(
        products.id,
        providers.id,
        productStats.productId,
        productStats.reviewsCount,
        productStats.bookingsCount,
        productStats.averageRating,
      )
      .orderBy(desc(productStats.averageRating), ...orderByClause)
      .limit(limit)
      .offset(offset),
  ]);

  const total = Number(countResult[0]?.count ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const page = Math.min(Math.floor(offset / limit) + 1, totalPages);

  return {
    data,
    pagination: {
      total,
      limit,
      offset,
      page,
      totalPages,
      hasNextPage: offset + limit < total,
      hasPrevPage: offset > 0,
    },
  };
}

export const providerDashboard = {
  getProviderStats,
  getProviderKPIs,
  getRecentBookings,
  getTopProducts,
  getBookingStatusBreakdown,
  getRevenueTimeSeries,
  getServices,
};
