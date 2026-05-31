import { db } from "@/db";
import { bookings, products, subscriptions } from "@/db/schemas";
import {
  DateRange,
  HeatmapCell,
  PayoutSummary,
  PeakBookingHours,
  RevenueDataPoint,
  RevenueOverTime,
} from "@/lib/panel-types";
import { and, eq, sql, gte, lte, inArray, sum, count } from "drizzle-orm";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function formatHourLabel(hour: number): string {
  if (hour === 0) return "12am";
  if (hour === 12) return "12pm";

  return hour < 12 ? `${hour}am` : `${hour - 12}pm`;
}

function getNextPayoutDate(): Date {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 1 = Monday …
  const daysUntilMonday = day === 1 ? 7 : (8 - day) % 7 || 7;
  const next = new Date(now);
  next.setDate(now.getDate() + daysUntilMonday);
  next.setHours(0, 0, 0, 0);
  return next;
}

function getPeriodRange(period: DateRange): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date();

  const daysMap: Record<DateRange, number> = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
    "1y": 365,
  };

  from.setDate(from.getDate() - daysMap[period]);
  return { from, to };
}

function getPreviousPeriodRange(period: DateRange): { from: Date; to: Date } {
  const current = getPeriodRange(period);
  const durationMs = current.to.getTime() - current.from.getTime();
  return {
    from: new Date(current.from.getTime() - durationMs),
    to: new Date(current.from.getTime()),
  };
}

export async function getPayoutSummary(
  providerId: string,
  period: DateRange = "90d",
): Promise<PayoutSummary> {
  const { from, to } = getPeriodRange(period);
  const prev = getPreviousPeriodRange(period);

  const [sub, [currentRevRow], [prevRevRow], [pendingRow]] = await Promise.all([
    db.query.subscriptions.findFirst({
      where: eq(subscriptions.providerId, providerId),
      with: {
        plan: {
          columns: {
            commissionRate: true,
          },
        },
      },
    }),
    db
      .select({ total: sum(bookings.totalAmount) })
      .from(bookings)
      .where(
        and(
          eq(bookings.providerId, providerId),
          inArray(bookings.status, ["completed", "confirmed"]),
          gte(bookings.createdAt, from),
          lte(bookings.createdAt, to),
        ),
      ),
    db
      .select({ total: sum(bookings.totalAmount) })
      .from(bookings)
      .where(
        and(
          eq(bookings.providerId, providerId),
          inArray(bookings.status, ["completed", "confirmed"]),
          gte(bookings.createdAt, prev.from),
          lte(bookings.createdAt, prev.to),
        ),
      ),
    db
      .select({ total: sum(bookings.totalAmount) })
      .from(bookings)
      .where(
        and(
          eq(bookings.providerId, providerId),
          eq(bookings.status, "pending"),
        ),
      ),
  ]);

  const commissionRate = parseFloat(sub?.plan.commissionRate ?? "0");
  const commissionPct = commissionRate / 100;

  const gross = Number(currentRevRow?.total ?? 0);
  const prevGross = Number(prevRevRow?.total ?? 0);
  const platformFeeAmount = Math.round(gross * commissionPct);
  const netPayout = gross - platformFeeAmount;

  const pendingGross = Number(pendingRow?.total ?? 0);
  const pendingFeeAmount = Math.round(pendingGross * commissionPct);
  const pendingNet = pendingGross - pendingFeeAmount;

  const changePercent =
    prevGross === 0
      ? 0
      : Math.round(((gross - prevGross) / prevGross) * 100 * 10) / 10;

  return {
    grossEarnings: gross,
    platformFeeAmount,
    platformFeeRate: commissionRate,
    netPayout,
    pendingPayoutAmount: pendingNet,
    nextPayoutDate: getNextPayoutDate(),
    periodComparison: {
      current: gross,
      previous: prevGross,
      changePercent,
    },
  };
}

export async function getPeakBookingHours(
  providerId: string,
  period: DateRange = "30d",
): Promise<PeakBookingHours> {
  const { from } = getPeriodRange(period);

  const rows = await db
    .select({
      dayOfWeek: sql<number>`EXTRACT(ISODOW FROM ${bookings.createdAt})::int - 1`,
      hour: sql<number>`EXTRACT(HOUR FROM ${bookings.createdAt})::int`,
      count: count(),
    })
    .from(bookings)
    .where(
      and(
        eq(bookings.providerId, providerId),
        inArray(bookings.status, ["confirmed", "completed", "pending"]),
        gte(bookings.createdAt, from),
        sql`EXTRACT(HOUR FROM ${bookings.createdAt}) BETWEEN 8 AND 22`,
      ),
    )
    .groupBy(
      sql`EXTRACT(ISODOW FROM ${bookings.createdAt})`,
      sql`EXTRACT(HOUR FROM ${bookings.createdAt})`,
    );

  const grid = new Map<number, number>();

  let maxCount = 0;
  let totalBookings = 0;
  let peakDay = 0;
  let peakHour = 12;
  let peakCount = 0;

  for (const row of rows) {
    const countValue = Number(row.count);
    const key = row.dayOfWeek * 24 + row.hour;

    grid.set(key, countValue);
    totalBookings += countValue;

    if (countValue > maxCount) {
      maxCount = countValue;
    }

    if (countValue > peakCount) {
      peakCount = countValue;
      peakDay = row.dayOfWeek;
      peakHour = row.hour;
    }
  }

  const cells: HeatmapCell[] = [];

  for (let hour = 8; hour <= 22; hour++) {
    for (let day = 0; day <= 6; day++) {
      const count = grid.get(day * 24 + hour) ?? 0;
      let intensity: 0 | 1 | 2 | 3 | 4 = 0;

      if (count > 0 && maxCount > 0) {
        const ratio = count / maxCount;
        intensity = ratio <= 0.2 ? 1 : ratio <= 0.45 ? 2 : ratio <= 0.7 ? 3 : 4;
      }

      cells.push({
        dayOfWeek: day,
        hour,
        count,
        hourLabel: formatHourLabel(hour),
        intensity,
      });
    }
  }

  return {
    cells,
    peakDay: DAY_NAMES[peakDay] ?? "N/A",
    peakHour: formatHourLabel(peakHour),
    totalBookingsInPeriod: totalBookings,
  };
}

export async function getRevenueOverTime(
  providerId: string,
  period: DateRange = "30d",
): Promise<RevenueOverTime> {
  const { from, to } = getPeriodRange(period);
  const prev = getPreviousPeriodRange(period);

  async function fetchSeries(start: Date, end: Date) {
    const rows = await db
      .select({
        date: sql<string>`(${bookings.createdAt}::date)`,
        revenue: sum(bookings.totalAmount),
        bookings: count(),
      })
      .from(bookings)
      .where(
        and(
          eq(bookings.providerId, providerId),
          inArray(bookings.status, ["confirmed", "completed"]),
          gte(bookings.createdAt, start),
          lte(bookings.createdAt, end),
        ),
      )
      .groupBy(sql`(${bookings.createdAt}::date)`)
      .orderBy(sql`(${bookings.createdAt}::date)`);

    const map = new Map<string, { revenue: number; bookings: number }>();

    for (const r of rows) {
      map.set(String(r.date), {
        revenue: Number(r.revenue ?? 0),
        bookings: Number(r.bookings ?? 0),
      });
    }

    // generate full range in single loop (faster)
    const result: RevenueDataPoint[] = [];

    const cursor = new Date(start);
    const endDay = new Date(end);
    cursor.setHours(0, 0, 0, 0);
    endDay.setHours(0, 0, 0, 0);

    while (cursor <= endDay) {
      const key = cursor.toISOString().slice(0, 10);
      const data = map.get(key);

      result.push({
        date: key,
        revenue: data?.revenue ?? 0,
        bookings: data?.bookings ?? 0,
      });

      cursor.setDate(cursor.getDate() + 1);
    }

    return result;
  }

  const [current, previous] = await Promise.all([
    fetchSeries(from, to),
    fetchSeries(prev.from, prev.to),
  ]);

  // single pass aggregation (faster)
  let totalRevenue = 0;
  let totalBookings = 0;

  let peakDay: RevenueDataPoint = current[0] ?? {
    date: "",
    revenue: 0,
    bookings: 0,
  };

  for (const d of current) {
    totalRevenue += d.revenue;
    totalBookings += d.bookings;

    if (d.revenue > peakDay.revenue) {
      peakDay = d;
    }
  }

  const avgDailyRevenue =
    current.length > 0 ? Math.round(totalRevenue / current.length) : 0;

  return {
    current,
    previous,
    totalRevenue,
    totalBookings,
    peakDay,
    avgDailyRevenue,
  };
}
