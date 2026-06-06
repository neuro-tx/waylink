"use client";

import { motion } from "motion/react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  ProviderKPIs,
  RevenueOverTime,
  GrowthMetric,
} from "@/lib/panel-types";

interface Props {
  kpis: ProviderKPIs;
  revenues: RevenueOverTime;
}

function GrowthBadge({ metric }: { metric: GrowthMetric }) {
  if (metric.direction === "n/a") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
        — New period
      </span>
    );
  }

  const isUp = metric.direction === "up";
  const isFlat = metric.direction === "flat";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-medium",
        isFlat && "text-muted-foreground",
        isUp && "text-emerald-600 dark:text-emerald-400",
        !isUp && !isFlat && "text-destructive",
      )}
    >
      {isFlat ? (
        <Minus className="size-3" />
      ) : isUp ? (
        <TrendingUp className="size-3" />
      ) : (
        <TrendingDown className="size-3" />
      )}
      {metric.formatted}
    </span>
  );
}

function fmt(n: number, type: "currency" | "percent" | "number" = "number") {
  if (type === "currency") {
    return n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toFixed(0)}`;
  }
  if (type === "percent") return `${n.toFixed(1)}%`;
  return n.toLocaleString();
}

export function AnalyticsKpiCards({ kpis, revenues }: Props) {
  const cards = [
    {
      label: "Total revenue",
      value: fmt(revenues.totalRevenue, "currency"),
      sub: `${revenues.totalBookings.toLocaleString()} bookings`,
      growth: kpis.revenueGrowth,
      accent: "border-l-blue-10",
      text: "text-blue-10",
    },
    {
      label: "Total bookings",
      value: revenues.totalBookings.toLocaleString(),
      sub: `Avg ${fmt(kpis.avgRevenuePerBooking, "currency")} / booking`,
      growth: kpis.bookingGrowth,
      accent: "border-l-green-500",
      text: "text-green-500",
    },
    {
      label: "Repeat customers",
      value: fmt(kpis.repeatCustomerRate, "percent"),
      sub: "Return booking rate",
      growth: null,
      accent: "border-l-orange-1",
      text: "text-orange-500",
    },
    {
      label: "Cancellation rate",
      value: fmt(kpis.cancellationRate, "percent"),
      sub: "Of all bookings",
      growth: null,
      invert: true,
      accent: "border-l-blue-20",
      text: "text-blue-20",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((c, i) => (
        <motion.div
          key={c.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: i * 0.07,
            ease: [0.16, 1, 0.3, 1],
          }}
          className={cn(
            "bg-card border border-border rounded-lg px-4 py-3.5",
            "border-l-[3px] rounded-l-xs",
            c.accent,
          )}
        >
          <p
            className={cn(
              "text-[11px] text-muted-foreground mb-1.5 uppercase tracking-wide",
            c.text)}
          >
            {c.label}
          </p>
          <p className="text-2xl font-semibold text-card-foreground tabular-nums leading-none mb-1.5">
            {c.value}
          </p>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-[11px] text-muted-foreground">{c.sub}</span>
            {c.growth && <GrowthBadge metric={c.growth} />}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
