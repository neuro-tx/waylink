"use client";

import {
  TrendingUp,
  CalendarCheck,
  CheckCircle2,
  Star,
  Heart,
  XCircle,
  Award,
  Users,
  Zap,
  RefreshCw,
  AlertCircle,
  Loader,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
  ComposedChart,
  Pie,
  PieChart,
  Cell,
} from "recharts";
import { BookingStatus } from "@/lib/all-types";
import { ServiceAnalyticsData } from "@/lib/panel-types";
import { fmtCurrency } from "@/lib/helpers";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { fmtDate } from "@/lib/utils";

type VariantStatus = "cancelled" | "available" | "sold_out";

const fmtN = (n: number) => new Intl.NumberFormat("en-US").format(n);

const bookingStatusMeta: Record<
  BookingStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  completed: { label: "Completed", variant: "default" },
  confirmed: { label: "Confirmed", variant: "secondary" },
  pending: { label: "Pending", variant: "outline" },
  cancelled: { label: "Cancelled", variant: "destructive" },
  expired: { label: "Expired", variant: "outline" },
};

const variantStatusMeta: Record<
  VariantStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  available: { label: "Available", variant: "default" },
  sold_out: { label: "Sold out", variant: "destructive" },
  cancelled: { label: "Cancelled", variant: "secondary" },
};

function scoreLabel(v: number): { label: string; className: string } {
  if (v >= 85)
    return {
      label: "Excellent",
      className: "text-emerald-600 dark:text-emerald-400",
    };
  if (v >= 70)
    return { label: "Good", className: "text-blue-600 dark:text-blue-400" };
  if (v >= 40)
    return { label: "Fair", className: "text-amber-600 dark:text-amber-500" };
  return { label: "Poor", className: "text-destructive" };
}

const trendChartConfig = {
  revenue: {
    label: "Revenue",
    color: "#8b5cf6",
  },
  bookingsCount: {
    label: "Bookings",
    color: "#c4b5fd",
  },
} satisfies ChartConfig;

const statusChartConfig = {
  completed: { label: "Completed", color: "#22c55e" },
  confirmed: { label: "Confirmed", color: "#3b82f6" },
  pending: { label: "Pending", color: "#f59e0b" },
  cancelled: { label: "Cancelled", color: "#ef4444" },
  expired: { label: "Expired", color: "#6b7280" },
} satisfies ChartConfig;

const paxChartConfig = {
  adult: { label: "Adult", color: "#22c55e" },
  child: { label: "Child", color: "#3b82f6" },
  infant: { label: "Infant", color: "#f59e0b" },
} satisfies ChartConfig;

function AnalysisClient({ data }: { data: ServiceAnalyticsData }) {
  const {
    stats,
    score,
    wishListCount,
    variants,
    bookingStatusBreakdown,
    passengerBreakDown,
    recentBookings,
    monthlyTrends,
  } = data;

  const cancelRate = stats.bookingsCount
    ? +((stats.cancelledBookingsCount / stats.bookingsCount) * 100).toFixed(1)
    : 0;

  const completionRate = stats.bookingsCount
    ? +((stats.completedBookingsCount / stats.bookingsCount) * 100).toFixed(1)
    : 0;

  const statusPieData = bookingStatusBreakdown.map((s) => ({
    ...s,
    fill: statusChartConfig[s.status].color,
  }));

  const paxPieData = passengerBreakDown.map((p) => ({
    ...p,
    fill: paxChartConfig[p.passengerType].color,
  }));

  const finalScoreMeta = scoreLabel(score.finalScore);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Service Analytics
        </h1>

        <p className="text-sm text-muted-foreground max-w-2xl">
          A complete overview of this service’s performance across its
          lifecycle. Monitor bookings, revenue, variants, and customer activity
          to understand how the service is performing and where it can improve.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-6 gap-2">
        {[
          {
            icon: <TrendingUp className="h-4 w-4" />,
            label: "Total revenue",
            value: fmtCurrency(parseFloat(stats.totalRevenue)),
            sub: `${fmtN(stats.bookingsCount)} bookings`,
            color: "text-pink-500",
          },
          {
            icon: <CalendarCheck className="h-4 w-4" />,
            label: "Bookings",
            value: fmtN(stats.bookingsCount),
            sub: stats.lastBookedAt
              ? `Last: ${fmtDate(stats.lastBookedAt)}`
              : "No bookings yet",
            color: "text-violet-500",
          },
          {
            icon: <CheckCircle2 className="h-4 w-4" />,
            label: "Completed",
            value: fmtN(stats.completedBookingsCount),
            sub: `${completionRate}% completion`,
            color: "text-green-500",
          },
          {
            icon: <Star className="h-4 w-4" />,
            label: "Avg rating",
            value: stats.averageRating
              ? parseFloat(stats.averageRating).toFixed(1)
              : "—",
            sub: `${fmtN(stats.reviewsCount)} reviews`,
            color: "text-amber-500",
          },
          {
            icon: <Heart className="h-4 w-4" />,
            label: "Wishlisted",
            value: fmtN(wishListCount),
            sub: "saved by users",
            color: "text-rose-500",
          },
          {
            icon: <XCircle className="h-4 w-4" />,
            label: "Cancellation",
            value: `${cancelRate}%`,
            sub: `${fmtN(stats.cancelledBookingsCount)} cancelled`,
            color:
              cancelRate > 15
                ? "text-red-500"
                : cancelRate > 5
                  ? "text-amber-500"
                  : "text-emerald-500",
          },
        ].map(({ icon, label, value, sub, color }) => (
          <Card key={label} className="gap-2 bg-card/50">
            <CardHeader className="px-3">
              <CardDescription
                className={`flex items-center gap-1.5 text-xs font-medium ${color}`}
              >
                {icon}
                {label}
              </CardDescription>
            </CardHeader>

            <CardContent className="px-3">
              <p className="text-xl font-semibold tabular-nums leading-none">
                {value}
              </p>

              {sub && (
                <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-3 bg-card/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Monthly revenue & bookings
            </CardTitle>
            <CardDescription className="text-xs">
              Last 12 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={trendChartConfig} className="h-55 w-full">
              <ComposedChart
                data={monthlyTrends}
                margin={{ top: 4, right: 12, bottom: 0, left: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="2 4" />
                <XAxis
                  dataKey="monthName"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                  tickMargin={5}
                />
                <YAxis
                  yAxisId="revenue"
                  orientation="left"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fontWeight: 600 }}
                  tickFormatter={(v) => `$${Math.round(v / 1000)}k`}
                  width={45}
                />
                <YAxis
                  yAxisId="bookings"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fontWeight: 600 }}
                  width={30}
                />
                <ChartTooltip
                  cursor={{
                    stroke: trendChartConfig.revenue.color,
                    strokeWidth: 1,
                    strokeDasharray: "4 4",
                  }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;

                    const revenue = payload.find(
                      (p) => p.dataKey === "revenue",
                    );

                    const bookings = payload.find(
                      (p) => p.dataKey === "bookingsCount",
                    );

                    const month = payload[0]?.payload?.monthName;

                    return (
                      <div className="min-w-45 rounded-lg border border-border/50 bg-background/80 p-4 shadow-xl backdrop-blur-sm">
                        <p className="mb-3 text-xs font-medium capitalize tracking-wide text-muted-foreground">
                          {month}
                        </p>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-6">
                            <div className="flex items-center gap-2">
                              <span
                                className="size-2.5 rounded-full"
                                style={{
                                  backgroundColor:
                                    trendChartConfig.revenue.color,
                                }}
                              />
                              <span className="text-sm text-muted-foreground">
                                Revenue
                              </span>
                            </div>

                            <span className="font-semibold tabular-nums">
                              {fmtCurrency((revenue?.value as number) ?? 0)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-6">
                            <div className="flex items-center gap-2">
                              <span
                                className="size-2.5 rounded-full"
                                style={{
                                  backgroundColor:
                                    trendChartConfig.bookingsCount.color,
                                }}
                              />
                              <span className="text-sm text-muted-foreground">
                                Bookings
                              </span>
                            </div>

                            <span className="font-semibold tabular-nums">
                              {bookings?.value ?? 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar
                  yAxisId="revenue"
                  dataKey="revenue"
                  fill={trendChartConfig.revenue.color}
                  radius={[5, 5, 0, 0]}
                  maxBarSize={35}
                />
                <Line
                  yAxisId="bookings"
                  type="monotone"
                  dataKey="bookingsCount"
                  stroke="var(--color-bookingsCount)"
                  strokeWidth={3}
                />
              </ComposedChart>
            </ChartContainer>
            <div className="flex gap-4 mt-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{
                    backgroundColor: trendChartConfig.revenue.color,
                  }}
                />
                Revenue
              </span>

              <span className="flex items-center gap-1.5">
                <span
                  className="w-5 border-t-2"
                  style={{
                    borderColor: trendChartConfig.bookingsCount.color,
                  }}
                />
                Bookings
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-card/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-amber-500" />
              Booking status
            </CardTitle>
            <CardDescription className="text-xs">
              All time breakdown
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ChartContainer
              config={statusChartConfig}
              className="h-45 w-full max-w-55"
            >
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => [
                        `${value} (${bookingStatusBreakdown.find((s) => s.status === name)?.percentage ?? 0}%)`,
                        bookingStatusMeta[name as BookingStatus]?.label ?? name,
                      ]}
                    />
                  }
                />
                <Pie
                  data={statusPieData}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={52}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {statusPieData.map((entry) => (
                    <Cell key={entry.status} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="flex flex-col gap-1.5 w-full mt-1">
              {bookingStatusBreakdown.map((s, i) => (
                <div
                  key={s.status}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <span
                      className="w-2 h-2 rounded-sm shrink-0"
                      style={{ background: statusChartConfig[s.status].color }}
                    />
                    {bookingStatusMeta[s.status].label}
                  </span>
                  <span className="font-medium tabular-nums">
                    {fmtN(s.count)}{" "}
                    <span className="text-muted-foreground font-normal">
                      ({s.percentage}%)
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-rose-500" />
              Passenger breakdown
            </CardTitle>
            <CardDescription className="text-xs">
              By passenger type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={paxChartConfig} className="h-50 w-full">
              <BarChart
                data={paxPieData}
                layout="vertical"
                margin={{ top: 0, right: 16, bottom: 0, left: 8 }}
              >
                <CartesianGrid
                  horizontal={false}
                  strokeDasharray="3 4"
                  className="stroke-border/40"
                />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  type="category"
                  dataKey="passengerType"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => v[0].toUpperCase() + v.slice(1)}
                  width={45}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(v) => [`${v} passengers`]}
                    />
                  }
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={30}>
                  {paxPieData.map((entry) => (
                    <Cell key={entry.passengerType} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="h-4 w-4 text-cyan-500" />
              Quality score
            </CardTitle>
            <CardDescription className="text-xs">
              Computed performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Final score</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-medium ${finalScoreMeta.className}`}
                >
                  {finalScoreMeta.label}
                </span>
                <span className="text-xl font-semibold tabular-nums">
                  {score.finalScore}
                  <span className="text-sm font-normal text-muted-foreground">
                    /100
                  </span>
                </span>
              </div>
            </div>
            <Progress value={score.finalScore} className="h-2" />

            {/* Sub-scores */}
            <div className="space-y-3.5">
              {[
                {
                  label: "Rating score",
                  value: score.ratingScore,
                  note: stats.averageRating
                    ? `${parseFloat(stats.averageRating).toFixed(1)} avg`
                    : undefined,
                },
                {
                  label: "Popularity",
                  value: score.popularityScore,
                  note: `${fmtN(stats.bookingsCount)} bookings`,
                },
                {
                  label: "Price score",
                  value: score.priceScore,
                  note: undefined,
                },
              ].map(({ label, value, note }) => {
                const meta = scoreLabel(value);
                return (
                  <div key={label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground">{label}</span>
                        {note && (
                          <span className="text-muted-foreground/60">
                            · {note}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-medium ${meta.className}`}
                        >
                          {meta.label}
                        </span>
                        <span className="font-medium tabular-nums">
                          {value}
                        </span>
                      </div>
                    </div>
                    <Progress value={value} className="h-1.5" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 w-full flex-col 2xl:flex-row">
        <Card className="flex-1 bg-card/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Variants performance
            </CardTitle>
            <CardDescription className="text-xs">
              {variants.length} variant{variants.length !== 1 ? "s" : ""} ·
              revenue from confirmed & completed bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Variant</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Capacity</TableHead>
                  <TableHead className="text-right">Bookings</TableHead>
                  <TableHead className="text-right">Participants</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {variants.map((v) => {
                  const meta = variantStatusMeta[v.status];

                  return (
                    <TableRow
                      key={v.varId}
                      className="transition-colors hover:bg-muted/40"
                    >
                      <TableCell>
                        <div className="max-w-60">
                          <p className="truncate font-medium">
                            {v.name || "Unnamed Variant"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ID #{v.varId.slice(0, 6)}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge variant={meta.variant}>{meta.label}</Badge>
                      </TableCell>

                      <TableCell className="text-right tabular-nums">
                        {fmtN(v.capacity)}
                      </TableCell>

                      <TableCell className="text-right tabular-nums">
                        {fmtN(v.bookingsCount)}
                      </TableCell>

                      <TableCell className="text-right tabular-nums">
                        {fmtN(v.totalParticipantsCount)}
                      </TableCell>

                      <TableCell className="text-right font-semibold tabular-nums">
                        {fmtCurrency(v.revenue)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="flex-1 bg-card/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Recent bookings
            </CardTitle>
            <CardDescription className="text-xs">
              Last {recentBookings.length} bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-22">Booking</TableHead>
                  <TableHead>Variant</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {recentBookings.map((b) => {
                  const meta = bookingStatusMeta[b.status];

                  return (
                    <TableRow
                      key={b.id}
                      className="transition-colors hover:bg-muted/40"
                    >
                      <TableCell>
                        <span className="rounded-md bg-muted px-2 py-1 font-mono text-xs">
                          #{b.id.slice(0, 6)}
                        </span>
                      </TableCell>

                      <TableCell>
                        <div className="max-w-22">
                          <p className="truncate font-medium">
                            {b.variantName || "Unnamed Variant"}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant={meta.variant}>{meta.label}</Badge>
                      </TableCell>

                      <TableCell className="tabular-nums">
                        {b.participantsCount}
                      </TableCell>

                      <TableCell className="text-right font-semibold tabular-nums">
                        {fmtCurrency(parseFloat(b.totalAmount))}
                      </TableCell>

                      <TableCell className="text-right text-muted-foreground">
                        {fmtDate(b.createdAt)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function ClientPage({ id }: { id: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ServiceAnalyticsData | null>(null);
  const [attempt, setAttempt] = useState(0);

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `${BASE_URL}/api/provider/panel/services/${id}`,
          { signal: controller.signal },
        );

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.message ?? `Request failed (${res.status})`);
        }

        const json = await res.json();
        setData(json.data ?? null);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setError(err.message ?? "Something went wrong");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => controller.abort();
  }, [id, attempt]);

  if (loading) {
    return (
      <div className="flex h-[95vh] w-full flex-col items-center justify-center gap-4">
        <Loader className="size-7 animate-spin text-primary" />

        <div className="text-center">
          <p className="font-medium">Loading analytics</p>
          <p className="text-sm text-muted-foreground">
            Please wait while we prepare your report.
          </p>
        </div>
      </div>
    );
  }

  if (error)
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/5 flex items-center justify-center mb-4">
          <AlertCircle className="h-5 w-5 text-red-500" />
        </div>

        <h2 className="text-lg font-semibold text-foreground">
          Failed to load analytics
        </h2>

        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          {error || "Something went wrong while loading your analytics data."}
        </p>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setAttempt((n) => n + 1)}
          className="mt-6 "
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </Button>
      </div>
    );

  if (data) return <AnalysisClient data={data!} />;
}
