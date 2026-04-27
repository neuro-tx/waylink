import { and, desc, eq, ilike, inArray, or, sql, count } from "drizzle-orm";
import type {
  Customer,
  CustomerOrder,
  CustomerStats,
  GetCustomersParams,
  Pagination,
} from "@/lib/all-types";
import { db } from "@/db";
import { bookings, products, user } from "@/db/schemas";
import { toCSV } from "@/lib/utils";

export const getProviderCustomers = async ({
  providerId,
  page = 1,
  limit = 10,
  status = null,
  segment = null,
  search = null,
  sort = "newest",
}: GetCustomersParams) => {
  const offset = (page - 1) * limit;

  /* ── Subquery: aggregated metrics per customer ── */
  const customerMetricsSq = db
    .select({
      userId: bookings.userId,
      totalOrders: sql<number>`count(${bookings.id})`.as("total_orders"),
      completedOrders:
        sql<number>`count(${bookings.id}) filter (where ${bookings.status} = 'confirmed')`.as(
          "completed_orders",
        ),
      lifetimeValue:
        sql<number>`coalesce(sum(${bookings.totalAmount}) filter (where ${bookings.status} in ('confirmed', 'completed')), 0)`.as(
          "lifetime_value",
        ),
      lastOrderAt: sql<Date>`max(${bookings.createdAt})`.as("last_order_at"),
      firstOrderAt: sql<Date>`min(${bookings.createdAt})`.as("first_order_at"),
    })
    .from(bookings)
    .innerJoin(products, eq(bookings.productId, products.id))
    .where(eq(products.providerId, providerId))
    .groupBy(bookings.userId)
    .as("customer_metrics");

  const statusSql = sql<string>`
    CASE
      WHEN ${user.banned} = true THEN 'blocked'
      WHEN ${customerMetricsSq.lastOrderAt} IS NULL THEN 'churned'
      WHEN NOW() - ${customerMetricsSq.lastOrderAt} > interval '90 days' THEN 'churned'
      ELSE 'active'
    END
  `;

  const segmentSql = sql<string>`
    CASE
      WHEN ${customerMetricsSq.completedOrders} >= 5 THEN 'loyal'
      WHEN ${customerMetricsSq.completedOrders} >= 2 THEN 'returning'
      ELSE 'new'
    END
  `;

  const conditions = [];

  if (search) {
    conditions.push(
      or(ilike(user.name, `%${search}%`), ilike(user.email, `%${search}%`)),
    );
  }

  if (status) {
    conditions.push(sql`${statusSql} = ${status}`);
  }

  if (segment) {
    conditions.push(sql`${segmentSql} = ${segment}`);
  }

  const orderByMap = {
    newest: desc(customerMetricsSq.firstOrderAt),
    oldest: customerMetricsSq.firstOrderAt,
    highest_ltv: desc(customerMetricsSq.lifetimeValue),
    lowest_ltv: customerMetricsSq.lifetimeValue,
    most_orders: desc(customerMetricsSq.totalOrders),
    recent_order: desc(customerMetricsSq.lastOrderAt),
  };

  const customersRaw = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      isBlocked: user.banned,
      totalOrders: customerMetricsSq.totalOrders,
      completedOrders: customerMetricsSq.completedOrders,
      lifetimeValue: customerMetricsSq.lifetimeValue,
      lastOrderAt: customerMetricsSq.lastOrderAt,
      firstOrderAt: customerMetricsSq.firstOrderAt,
      status: statusSql.as("status"),
      segment: segmentSql.as("segment"),
    })
    .from(customerMetricsSq)
    .innerJoin(user, eq(customerMetricsSq.userId, user.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(orderByMap[sort] ?? desc(customerMetricsSq.firstOrderAt))
    .limit(limit)
    .offset(offset);

  // Count query (for pagination)
  const [{ total }] = await db
    .select({ total: count() })
    .from(customerMetricsSq)
    .innerJoin(user, eq(customerMetricsSq.userId, user.id))
    .where(conditions.length ? and(...conditions) : undefined);

  const statsRaw = await db
    .select({
      total: count(),
      active: sql<number>`count(*) filter (where ${statusSql} = 'active')`,
      blocked: sql<number>`count(*) filter (where ${statusSql} = 'blocked')`,
      churned: sql<number>`count(*) filter (where ${statusSql} = 'churned')`,
      avgLifetimeValue: sql<number>`coalesce(avg(${customerMetricsSq.lifetimeValue}), 0)`,
      totalRevenue: sql<number>`coalesce(sum(${customerMetricsSq.lifetimeValue}), 0)`,
    })
    .from(customerMetricsSq)
    .innerJoin(user, eq(customerMetricsSq.userId, user.id))
    .where(conditions.length ? and(...conditions) : undefined);

  const stats: CustomerStats = {
    total: Number(statsRaw[0].total),
    active: Number(statsRaw[0].active),
    blocked: Number(statsRaw[0].blocked),
    churned: Number(statsRaw[0].churned),
    avgLifetimeValue: Math.round(Number(statsRaw[0].avgLifetimeValue)),
    totalRevenue: Number(statsRaw[0].totalRevenue),
  };

  const customerIds = customersRaw.map((c) => c.id);
  const ordersMap = new Map<string, CustomerOrder[]>();

  if (customerIds.length) {
    const orders = await db
      .select({
        id: bookings.id,
        userId: bookings.userId,
        status: bookings.status,
        totalAmount: bookings.totalAmount,
        currency: bookings.currency,
        createdAt: bookings.createdAt,
        productName: products.title,
      })
      .from(bookings)
      .innerJoin(products, eq(bookings.productId, products.id))
      .where(
        and(
          eq(products.providerId, providerId),
          inArray(bookings.userId, customerIds),
        ),
      )
      .orderBy(desc(bookings.createdAt));

    for (const o of orders) {
      if (!ordersMap.has(o.userId)) ordersMap.set(o.userId, []);
      ordersMap.get(o.userId)!.push({
        id: o.id,
        status: o.status as CustomerOrder["status"],
        totalAmount: Number(o.totalAmount),
        currency: o.currency,
        createdAt: o.createdAt,
        productName: o.productName,
      });
    }
  }

  /* ── Final shaping ── */
  const customers: Customer[] = customersRaw.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    image: c.image,
    status: c.status as any,
    segment: c.segment as any,
    lifetimeValue: Number(c.lifetimeValue),
    totalOrders: Number(c.totalOrders),
    completedOrders: Number(c.completedOrders),
    lastOrderAt: c.lastOrderAt ?? null,
    firstOrderAt: c.firstOrderAt ?? null,
    currency: "USD",
    orders: ordersMap.get(c.id) ?? [],
  }));

  const totalPages = Math.ceil(total / limit) || 1;

  const pagination: Pagination = {
    total,
    limit,
    offset,
    page,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };

  return { customers, stats, pagination };
};

export const getProviderCustomersExport = async (providerId: string) => {
  const { customers } = await getProviderCustomers({
    providerId,
    page: 1,
    limit: 10_000,
  });

  return customers.map((c) => ({
    Name: c.name,
    Email: c.email,
    Status: c.status,
    Segment: c.segment,
    TotalOrders: c.totalOrders,
    CompletedOrders: c.completedOrders,
    LifetimeValue: c.lifetimeValue,
    Currency: c.currency,
    FirstOrder: c.firstOrderAt ? new Date(c.firstOrderAt).toISOString() : "",
    LastOrder: c.lastOrderAt ? new Date(c.lastOrderAt).toISOString() : "",
  }));
};

export async function exportProviderCustomersCsv(
  providerId: string,
): Promise<string> {
  const rows = await getProviderCustomersExport(providerId);

  return toCSV(rows);
}
