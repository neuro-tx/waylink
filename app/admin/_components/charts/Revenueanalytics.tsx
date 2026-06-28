"use client";

import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, Zap, BarChart2 } from "lucide-react";
import { RevenueOverTime } from "@/lib/panel-types";
import { cn, fmtDate } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { fmtCurrency } from "@/lib/helpers";

const MOCK: RevenueOverTime = {
  totalRevenue: 184500,
  totalBookings: 341,
  avgDailyRevenue: 6150,
  peakDay: { date: "2024-11-15", revenue: 14200, bookings: 22 },
  current: [
    { date: "Nov 01", revenue: 4200, bookings: 7 },
    { date: "Nov 02", revenue: 3800, bookings: 6 },
    { date: "Nov 03", revenue: 6100, bookings: 9 },
    { date: "Nov 04", revenue: 5400, bookings: 8 },
    { date: "Nov 05", revenue: 7800, bookings: 12 },
    { date: "Nov 06", revenue: 9200, bookings: 15 },
    { date: "Nov 07", revenue: 8600, bookings: 13 },
    { date: "Nov 08", revenue: 6900, bookings: 10 },
    { date: "Nov 09", revenue: 5200, bookings: 8 },
    { date: "Nov 10", revenue: 7100, bookings: 11 },
    { date: "Nov 11", revenue: 11400, bookings: 18 },
    { date: "Nov 12", revenue: 10800, bookings: 17 },
    { date: "Nov 13", revenue: 9600, bookings: 15 },
    { date: "Nov 14", revenue: 12300, bookings: 19 },
    { date: "Nov 15", revenue: 14200, bookings: 22 },
    { date: "Nov 16", revenue: 8900, bookings: 14 },
    { date: "Nov 17", revenue: 7400, bookings: 11 },
    { date: "Nov 18", revenue: 6800, bookings: 10 },
    { date: "Nov 19", revenue: 5900, bookings: 9 },
    { date: "Nov 20", revenue: 8200, bookings: 13 },
    { date: "Nov 21", revenue: 9800, bookings: 15 },
    { date: "Nov 22", revenue: 11200, bookings: 17 },
    { date: "Nov 23", revenue: 10400, bookings: 16 },
    { date: "Nov 24", revenue: 7600, bookings: 12 },
    { date: "Nov 25", revenue: 6200, bookings: 10 },
    { date: "Nov 26", revenue: 8800, bookings: 14 },
    { date: "Nov 27", revenue: 13100, bookings: 20 },
    { date: "Nov 28", revenue: 12600, bookings: 19 },
    { date: "Nov 29", revenue: 9400, bookings: 15 },
    { date: "Nov 30", revenue: 7800, bookings: 12 },
  ],
  previous: [
    { date: "Oct 01", revenue: 3600, bookings: 6 },
    { date: "Oct 02", revenue: 4100, bookings: 7 },
    { date: "Oct 03", revenue: 5200, bookings: 8 },
    { date: "Oct 04", revenue: 4800, bookings: 7 },
    { date: "Oct 05", revenue: 6400, bookings: 10 },
    { date: "Oct 06", revenue: 7900, bookings: 12 },
    { date: "Oct 07", revenue: 7200, bookings: 11 },
    { date: "Oct 08", revenue: 5800, bookings: 9 },
    { date: "Oct 09", revenue: 4600, bookings: 7 },
    { date: "Oct 10", revenue: 6200, bookings: 9 },
    { date: "Oct 11", revenue: 9800, bookings: 15 },
    { date: "Oct 12", revenue: 9100, bookings: 14 },
    { date: "Oct 13", revenue: 8300, bookings: 13 },
    { date: "Oct 14", revenue: 10600, bookings: 16 },
    { date: "Oct 15", revenue: 11900, bookings: 18 },
    { date: "Oct 16", revenue: 7600, bookings: 12 },
    { date: "Oct 17", revenue: 6400, bookings: 10 },
    { date: "Oct 18", revenue: 5800, bookings: 9 },
    { date: "Oct 19", revenue: 5100, bookings: 8 },
    { date: "Oct 20", revenue: 7100, bookings: 11 },
    { date: "Oct 21", revenue: 8400, bookings: 13 },
    { date: "Oct 22", revenue: 9700, bookings: 15 },
    { date: "Oct 23", revenue: 8900, bookings: 14 },
    { date: "Oct 24", revenue: 6500, bookings: 10 },
    { date: "Oct 25", revenue: 5400, bookings: 8 },
    { date: "Oct 26", revenue: 7600, bookings: 12 },
    { date: "Oct 27", revenue: 11200, bookings: 17 },
    { date: "Oct 28", revenue: 10800, bookings: 16 },
    { date: "Oct 29", revenue: 8100, bookings: 13 },
    { date: "Oct 30", revenue: 6700, bookings: 10 },
  ],
};

const COLORS = {
  current: { line: "#a78bfa", fill: "#7c3aed", glow: "rgba(167,139,250,0.15)" },
  previous: { line: "#475569", fill: "#334155", glow: "rgba(71,85,105,0.08)" },
  bookings: { line: "#fb923c", fill: "#ea580c", glow: "rgba(251,146,60,0.15)" },
  peak: "#f43f5e",
};

function fmtFull(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function pct(current: number, previous: number) {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
}

function RevenueTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const cur = payload.find((p: any) => p.dataKey === "current")?.value as
    | number
    | undefined;
  const prev = payload.find((p: any) => p.dataKey === "previous")?.value as
    | number
    | undefined;
  const change = cur != null && prev != null ? pct(cur, prev) : null;

  return (
    <div className="rounded-md border bg-card/65 backdrop-blur-md p-3 shadow-xl min-w-45">
      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">
        {label}
      </p>

      {cur != null && (
        <div className="flex items-center justify-between gap-6 mb-1">
          <div className="flex items-center gap-1.5">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: COLORS.current.line }}
            />
            <span className="text-xs text-muted-foreground">This period</span>
          </div>
          <span className="text-sm font-semibold tabular-nums">
            {fmtFull(cur)}
          </span>
        </div>
      )}

      {prev != null && (
        <div className="flex items-center justify-between gap-6 mb-2">
          <div className="flex items-center gap-1.5">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: COLORS.previous.line }}
            />
            <span className="text-xs text-muted-foreground">Prior period</span>
          </div>
          <span className="text-sm font-semibold tabular-nums">
            {fmtFull(prev)}
          </span>
        </div>
      )}

      {change != null && (
        <div
          className={cn(
            "flex items-center gap-1 text-xs font-medium mt-1 pt-2 border-t border-border/50",
            change >= 0 ? "text-violet-500" : "text-rose-500",
          )}
        >
          {change >= 0 ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {change >= 0 ? "+" : ""}
          {change.toFixed(1)}% vs prior period
        </div>
      )}
    </div>
  );
}

function BookingsTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value as number;

  return (
    <div className="rounded-md border bg-card/65 backdrop-blur-md p-4 shadow-xl min-w-35">
      <p className="text-xs font-semibold text-muted-foreground mb-2">
        {label}
      </p>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: COLORS.bookings.line }}
          />
          <span className="text-sm">Bookings</span>
        </div>
        <span className="text-xs font-semibold tabular-nums">{val}</span>
      </div>
    </div>
  );
}

function Delta({ value }: { value: number | null }) {
  if (value === null) return null;
  const up = value > 0;
  const flat = value === 0;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-1 rounded-xs ${
        flat
          ? "bg-muted text-foreground"
          : up
            ? "bg-violet-500/15 text-violet-500"
            : "bg-rose-500/15 text-rose-500"
      }`}
    >
      {flat ? (
        <Minus className="size-3" />
      ) : up ? (
        <TrendingUp className="size-3" />
      ) : (
        <TrendingDown className="size-3" />
      )}
      {flat ? "—" : `${up ? "+" : ""}${value.toFixed(1)}%`}
    </span>
  );
}

function StatPill({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent: string;
}) {
  return (
    <div className="grid gap-1 p-4 rounded-md border">
      <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
        {label}
      </p>
      <p
        className="text-lg font-semibold tracking-tight"
        style={{ color: accent }}
      >
        {value}
      </p>
      {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

interface Props {
  data?: RevenueOverTime;
}

export function RevenueAnalytics({ data = MOCK }: Props) {
  const [showPrevious, setShowPrevious] = useState(true);

  const mergedRevenue = useMemo(() => {
    const len = Math.max(data.current.length, data.previous.length);
    return Array.from({ length: len }, (_, i) => ({
      label: data.current[i]
        ? new Date(data.current[i].date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        : `Day ${i + 1}`,
      current: data.current[i]?.revenue ?? null,
      previous: data.previous[i]?.revenue ?? null,
    }));
  }, [data]);

  const bookingsData = useMemo(
    () =>
      data.current.map((p) => ({
        label: new Date(p.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        bookings: p.bookings,
      })),
    [data],
  );

  const prevTotal = useMemo(
    () => data.previous.reduce((s, p) => s + p.revenue, 0),
    [data],
  );
  const prevBookings = useMemo(
    () => data.previous.reduce((s, p) => s + p.bookings, 0),
    [data],
  );
  const revDelta = pct(data.totalRevenue, prevTotal);
  const bookDelta = pct(data.totalBookings, prevBookings);

  const peakLabel = fmtDate(data.peakDay.date);
  const tickInterval = Math.max(1, Math.floor(mergedRevenue.length / 6));

  return (
    <div className="rounded-md w-full border overflow-hidden">
      <div className="flex items-start justify-between gap-4 p-4 border-b border-b-border/70">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart2 className="h-5 w-5 text-violet-500" />
            <h3 className="text-base font-semibold">Revenue & Bookings</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Period-over-period comparison
          </p>
        </div>

        <button
          onClick={() => setShowPrevious((v) => !v)}
          className={cn(
            "flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-sm border transition-all",
            showPrevious ? "text-foreground" : "text-muted-foreground",
          )}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: COLORS.previous.line }}
          />
          Prior period
        </button>
      </div>

      {/* ── Stat pills ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 border-b border-b-border/70">
        <div className="grid gap-1.5 p-3 rounded-md border">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
            Revenue
          </p>
          <p className="text-lg font-semibold tracking-tight text-violet-500">
            {fmtFull(data.totalRevenue)}
          </p>
          <Delta value={revDelta} />
        </div>

        <div className="grid gap-1.5 p-3 rounded-md border">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
            Bookings
          </p>
          <p className="text-lg font-semibold tracking-tight text-amber-400 dark:text-amber-300">
            {data.totalBookings}
          </p>
          <Delta value={bookDelta} />
        </div>

        <StatPill
          label="Daily avg"
          value={fmtCurrency(data.avgDailyRevenue)}
          sub="per active day"
          accent="#a78bfa"
        />

        <div className="grid gap-1.5 p-3 rounded-md border border-rose-500/15 bg-rose-500/5">
          <div className="flex items-center gap-1 mb-0.5">
            <Zap className="size-3 text-rose-500" />
            <p className="text-xs uppercase tracking-widest text-rose-500 font-medium">
              Peak day
            </p>
          </div>
          <p className="text-sm font-semibold text-rose-400">
            {fmtFull(data.peakDay.revenue)}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {peakLabel} · {data.peakDay.bookings} bookings
          </p>
        </div>
      </div>

      {/* ── Chart 1: Revenue area ── */}
      <div className="px-4 pt-5 pb-2">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-medium">Revenue</span>
          <div className="flex items-center gap-3 ml-auto">
            <div className="flex items-center gap-1.5">
              <div
                className="h-2 w-5 rounded-sm"
                style={{
                  background: `linear-gradient(90deg, ${COLORS.current.fill}, ${COLORS.current.line})`,
                }}
              />
              <span className="text-[11px] font-medium">This period</span>
            </div>
            {showPrevious && (
              <div className="flex items-center gap-1.5">
                <div
                  className="h-2 w-5 rounded-sm"
                  style={{ background: COLORS.previous.fill }}
                />
                <span className="text-[11px] text-muted-foreground">
                  Prior period
                </span>
              </div>
            )}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <AreaChart
            data={mergedRevenue}
            margin={{ top: 10, right: 4, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient id="revCurrent" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={COLORS.current.fill}
                  stopOpacity={0.45}
                />
                <stop
                  offset="100%"
                  stopColor={COLORS.current.fill}
                  stopOpacity={0.02}
                />
              </linearGradient>
              <linearGradient id="revPrevious" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={COLORS.previous.fill}
                  stopOpacity={0.25}
                />
                <stop
                  offset="100%"
                  stopColor={COLORS.previous.fill}
                  stopOpacity={0.01}
                />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              vertical={false}
            />

            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "#7c3aed" }}
              tickLine={false}
              axisLine={false}
              interval={tickInterval}
            />
            <YAxis
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={40}
            />

            <Tooltip
              content={<RevenueTooltip />}
              cursor={{
                stroke: "#7c3aed5f",
                strokeWidth: 1,
                strokeDasharray: "4 2",
              }}
            />

            <ReferenceLine
              x={peakLabel}
              stroke={COLORS.peak}
              strokeWidth={2}
              strokeDasharray="4 3"
              label={{
                value: "Peak",
                position: "insideTop",
                fontSize: 12,
                fill: COLORS.peak,
                fontWeight: 600,
              }}
            />

            {showPrevious && (
              <Area
                type="monotone"
                dataKey="previous"
                stroke={COLORS.previous.line}
                strokeWidth={1.5}
                fill="url(#revPrevious)"
                dot={false}
                activeDot={false}
                strokeDasharray="4 3"
                connectNulls
              />
            )}

            <Area
              type="monotone"
              dataKey="current"
              stroke={COLORS.current.line}
              strokeWidth={2}
              fill="url(#revCurrent)"
              dot={false}
              activeDot={{
                r: 4,
                fill: COLORS.current.line,
                strokeWidth: 2,
              }}
              connectNulls
              filter="url(#glow)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <Separator />

      {/* ── Chart 2: Bookings bar ── */}
      <div className="px-4 pt-5 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-medium">Bookings per day</span>
          <div className="flex items-center gap-1.5 ml-auto">
            <div
              className="h-2 w-5 rounded-sm"
              style={{
                background: `linear-gradient(90deg, ${COLORS.bookings.fill}, ${COLORS.bookings.line})`,
              }}
            />
            <span className="text-xs text-muted-foreground">Bookings</span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={bookingsData}
            barSize={6}
            margin={{ top: 5, right: 4, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={COLORS.bookings.line}
                  stopOpacity={0.9}
                />
                <stop
                  offset="100%"
                  stopColor={COLORS.bookings.fill}
                  stopOpacity={0.5}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              vertical={false}
            />

            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "#fb923c" }}
              tickLine={false}
              axisLine={false}
              interval={tickInterval}
            />
            <YAxis
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={28}
            />

            <Tooltip
              content={<BookingsTooltip />}
              cursor={{ fill: "#ea580c3c", radius: 4 }}
            />

            <Bar
              dataKey="bookings"
              fill="url(#barGrad)"
              radius={[3, 3, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
