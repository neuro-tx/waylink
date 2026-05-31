import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  CalendarCheck,
  CheckCircle2,
  CircleDollarSign,
  Package,
  Star,
  TrendingUp,
} from "lucide-react";
import { ProviderStats } from "@/lib/panel-types";
import { fmtCurrency, fmtDateTime } from "@/lib/helpers";

interface ProviderStatsProps {
  stats: ProviderStats;
}

export function ProviderStatsOverview({ stats }: ProviderStatsProps) {
  const hasLimit = stats.maxListings !== null;

  const usagePercentage =
    stats.maxListings && stats.maxListings > 0
      ? Math.min((stats.totalProducts / stats.maxListings) * 100, 100)
      : 0;

  const progressColor =
    usagePercentage >= 90
      ? "bg-destructive"
      : usagePercentage >= 75
        ? "bg-amber-500"
        : "bg-violet-500";

  return (
    <div className="w-full rounded-xl border bg-card overflow-hidden">
      <div className="min-w-0 p-4 border-b">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold tracking-tight">
            Provider Overview
          </h2>

          <Badge variant={stats.canCreateListing ? "default" : "destructive"}>
            {stats.canCreateListing ? "Active" : "Capacity Reached"}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground">
          Last updated{" "}
          <span className="text-foreground">
            {fmtDateTime(stats.updatedAt)}
          </span>
        </p>
      </div>

      {/* Metrics */}
      <div className="p-4">
        <div className="space-y-1">
          <MetricRow
            icon={<CircleDollarSign className="size-5 text-emerald-500" />}
            label="Lifetime Revenue"
            helper="Total earnings generated"
            value={fmtCurrency(stats.totalRevenue)}
            badge={
              <Badge variant="secondary" className="gap-1">
                <TrendingUp className="size-3" />
                All Time
              </Badge>
            }
          />

          <Separator />

          <MetricRow
            icon={<CalendarCheck className="size-5 text-blue-500" />}
            label="Total Bookings"
            helper="Confirmed and completed bookings"
            value={stats.totalBookings.toLocaleString()}
          />

          <Separator />

          <MetricRow
            icon={<Star className="size-5 text-amber-500" />}
            label="Average Rating"
            helper={`${stats.totalReviews.toLocaleString()} reviews`}
            value={stats.avgRating ? Number(stats.avgRating).toFixed(1) : "N/A"}
          />
        </div>

        {/* Capacity */}
        <div className="mt-6 rounded-xl border bg-muted/20 p-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-violet-500/10 p-2.5">
                <Package className="size-5 text-violet-500" />
              </div>

              <div>
                <h3 className="font-medium">Listing Capacity</h3>

                <p className="text-sm text-muted-foreground">
                  {stats.totalProducts} active products
                </p>
              </div>
            </div>

            {hasLimit ? (
              <div className="text-right">
                <p className="text-lg font-semibold tabular-nums">
                  {stats.remainingListings}
                </p>
                <p className="text-xs text-muted-foreground">remaining</p>
              </div>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <CheckCircle2 className="size-3.5" />
                Unlimited
              </Badge>
            )}
          </div>

          {hasLimit && (
            <>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Usage</span>
                <span className="font-medium tabular-nums">
                  {usagePercentage.toFixed(0)}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className={`h-full transition-all duration-700 ${progressColor}`}
                  style={{
                    width: `${usagePercentage}%`,
                  }}
                />
              </div>

              {usagePercentage >= 90 && (
                <div className="mt-3 flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>
                    You are approaching your listing limit. Consider upgrading
                    your plan.
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

type MetricRowProps = {
  icon: React.ReactNode;
  label: string;
  helper?: string;
  value: React.ReactNode;
  badge?: React.ReactNode;
};

function MetricRow({ icon, label, helper, value, badge }: MetricRowProps) {
  return (
    <div className="flex items-center gap-4 py-2">
      <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium">{label}</p>
          {badge}
        </div>

        {helper && <p className="text-sm text-muted-foreground">{helper}</p>}
      </div>

      <div className="text-right">
        <p className="text-lg font-semibold tracking-tight tabular-nums">
          {value}
        </p>
      </div>
    </div>
  );
}
