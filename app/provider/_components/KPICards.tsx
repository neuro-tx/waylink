import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { GrowthMetric, ProviderKPIs } from "@/lib/panel-types";
import { ArrowUp, ArrowDown, ArrowRight, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

function GrowthBadge({
  metric,
  className,
}: {
  metric: GrowthMetric;
  className?: string;
}) {
  if (!metric || metric.direction === "n/a") {
    return (
      <span className="text-xs font-medium text-muted-foreground">No data</span>
    );
  }

  const variants = {
    up: {
      icon: ArrowUp,
      classes: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      sr: "Increased by",
    },
    down: {
      icon: ArrowDown,
      classes: "bg-red-500/10 text-red-600 dark:text-red-400",
      sr: "Decreased by",
    },
    flat: {
      icon: ArrowRight,
      classes: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      sr: "Changed by",
    },
  };

  const variant =
    variants[
      metric.direction === "up"
        ? "up"
        : metric.direction === "down"
          ? "down"
          : "flat"
    ];
  const Icon = variant.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold",
        variant.classes,
        className,
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      {metric.formatted}
      <span className="sr-only">
        {variant.sr} {metric.formatted}
      </span>
    </span>
  );
}

interface KPIItemProps {
  label: string;
  value: string | number;
  subtext?: string;
  badge?: React.ReactNode;
  progress?: number;
  progressColor?: string;
}

function KPIItem({
  label,
  value,
  subtext,
  badge,
  progress,
  progressColor = "bg-primary",
}: KPIItemProps) {
  return (
    <div className="flex flex-col justify-between space-y-4 rounded-xl border border-border/50 bg-muted/20 p-5 transition-colors hover:bg-muted/50 relative overflow-hidden group">
      <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full blur-2xl opacity-0 scale-75 transition-all duration-500 ease-out group-hover:opacity-100 group-hover:scale-100 bg-cyan-500/15"/>
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-bold tracking-tight text-foreground">
            {value}
          </h3>
          {badge}
        </div>
      </div>

      <div className="mt-auto pt-2">
        {progress !== undefined && (
          <div
            className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500 ease-in-out",
                progressColor,
              )}
              style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
            />
          </div>
        )}
        {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
      </div>
    </div>
  );
}

export function KPICards({ kpis }: { kpis: ProviderKPIs }) {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(val);

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="space-y-1">
          <CardTitle className="text-xl font-semibold tracking-tight">
            Performance Insights
          </CardTitle>
          <CardDescription className="text-sm">
            Key health signals for this period
          </CardDescription>
        </div>
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
          <Activity className="size-5 text-primary" aria-hidden="true" />
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <KPIItem
            label="Revenue Growth"
            value={kpis.revenueGrowth.formatted}
            badge={<GrowthBadge metric={kpis.revenueGrowth} />}
            subtext="vs. previous period"
            progressColor="bg-blue-500 dark:bg-blue-600"
            progress={
              kpis.revenueGrowth.value != null
                ? Math.abs(kpis.revenueGrowth.value)
                : undefined
            }
          />
          <KPIItem
            label="Booking Growth"
            value={kpis.bookingGrowth.formatted}
            badge={<GrowthBadge metric={kpis.bookingGrowth} />}
            subtext="vs. previous period"
            progressColor="bg-violet-500 dark:bg-violet-600"
            progress={
              kpis.bookingGrowth.value != null
                ? Math.abs(kpis.bookingGrowth.value)
                : undefined
            }
          />
          <KPIItem
            label="Repeat Customer Rate"
            value={`${kpis.repeatCustomerRate.toFixed(1)}%`}
            subtext="Customers with 2+ bookings"
            progress={kpis.repeatCustomerRate}
            progressColor="bg-emerald-500 dark:bg-emerald-600"
          />
          <KPIItem
            label="Avg. Revenue / Booking"
            value={formatCurrency(kpis.avgRevenuePerBooking)}
            subtext="Total revenue ÷ total bookings"
          />
          <KPIItem
            label="Cancellation Rate"
            value={`${kpis.cancellationRate.toFixed(1)}%`}
            subtext="Proportion of cancelled bookings"
            progress={kpis.cancellationRate}
            progressColor={
              kpis.cancellationRate > 15
                ? "bg-red-500 dark:bg-red-600"
                : "bg-amber-400 dark:bg-amber-500"
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
