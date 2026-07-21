"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CardContent } from "@/components/ui/card";
import { DateRange, RevenueDataPoint } from "@/lib/panel-types";
import { useMemo } from "react";
import { Calendar } from "lucide-react";

export function RevenueBookingsChart({ range }: { range: DateRange }) {
  const baseColr = "#12cfdc";
  const COLOR_REVENUE = "#0ea5e9";
  const COLOR_BOOKINGS = "#10b981";

  const data: RevenueDataPoint[] = [
    { date: "2025-08", revenue: 18450, bookings: 132 },
    { date: "2025-09", revenue: 20120, bookings: 146 },
    { date: "2025-10", revenue: 21980, bookings: 158 },
    { date: "2025-11", revenue: 24750, bookings: 171 },
    { date: "2025-12", revenue: 31840, bookings: 228 },
    { date: "2026-01", revenue: 27420, bookings: 194 },
    { date: "2026-02", revenue: 29680, bookings: 206 },
    { date: "2026-03", revenue: 33590, bookings: 233 },
    { date: "2026-04", revenue: 36210, bookings: 251 },
    { date: "2026-05", revenue: 39850, bookings: 276 },
    { date: "2026-06", revenue: 42160, bookings: 291 },
    { date: "2026-07", revenue: 45780, bookings: 315 },
  ];

  const formattedData = useMemo(() => {
    return data.map((d) => {
      const dateObj = new Date(d.date);

      return {
        ...d,
        dateObj,
        dateFormatted: dateObj.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      };
    });
  }, [data]);

  const formatCompactCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(val);

  const formatFullCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(val);

  return (
    <Card className="border-none">
      <CardHeader>
        <CardTitle>Revenue & Bookings Overview</CardTitle>
        <CardDescription className="text-muted-foreground text-sm">
          Monthly performance metrics across the fiscal year.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="h-68 w-full">
          <ResponsiveContainer>
            <AreaChart
              data={formattedData}
              margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={COLOR_REVENUE}
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor={COLOR_REVENUE}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={COLOR_BOOKINGS}
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor={COLOR_BOOKINGS}
                    stopOpacity={0}
                  />
                </linearGradient>

                <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                className="stroke-border/50"
              />

              <XAxis
                dataKey="dateObj"
                tickFormatter={(date) =>
                  new Date(date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                minTickGap={20}
                tick={{ fontSize: 15, fontWeight: "500" }}
              />

              <YAxis
                yAxisId="left"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                width={50}
                tickFormatter={formatCompactCurrency}
                tick={{ fontSize: 13 }}
              />

              <YAxis
                yAxisId="right"
                orientation="right"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                width={0}
                tick={{ fill: baseColr, opacity: 0.6, fontSize: 13 }}
              />

              <Tooltip
                cursor={{
                  stroke: baseColr,
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;

                  const revenue = payload.find((p) => p.dataKey === "revenue");
                  const bookings = payload.find(
                    (p) => p.dataKey === "bookings",
                  );

                  const label = payload[0]?.payload?.dateFormatted;

                  return (
                    <div className="rounded-xl min-w-40 border border-border/50 bg-background/20 p-3 shadow-xl backdrop-blur-sm sm:p-4">
                      <div className="flex items-center gap-2 border-b pb-1">
                        <Calendar className="size-4" />
                        <span className="text-sm font-medium">{label}</span>
                      </div>

                      <div className="space-y-1 mt-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="size-2 rounded-full"
                            style={{ background: baseColr }}
                          />
                          <p className="text-sm font-bold text-foreground">
                            {formatFullCurrency(revenue?.value as number)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <div
                            className="size-2 rounded-full"
                            style={{ background: "#22c55e" }}
                          />
                          <p className="text-xs text-muted-foreground">
                            {bookings?.value} bookings
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />

              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke={baseColr}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                activeDot={{ r: 6, strokeWidth: 0, fill: baseColr }}
              />

              <Area
                type="monotone"
                dataKey="bookings"
                stroke="#22c55e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorBookings)"
                activeDot={{ r: 5, strokeWidth: 0, fill: "#22c55e" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
