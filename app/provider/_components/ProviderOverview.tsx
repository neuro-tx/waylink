"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Package,
  Star,
  DollarSign,
  Calendar,
  LucideIcon,
} from "lucide-react";
import { ProviderStats } from "@/lib/panel-types";
import { cn } from "@/lib/utils";

export function ProviderOverview({ stats }: { stats: ProviderStats | null }) {
  if (!stats) {
    return (
      <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-red-500 font-medium">
            No stats available
          </span>
        </div>
        <p className="text-muted-foreground text-sm">
          try refreshing or check back later
        </p>
      </div>
    );
  }

  const {
    totalProducts,
    totalReviews,
    avgRating,
    totalRevenue,
    totalBookings,
    maxListings,
    remainingListings,
    canCreateListing,
  } = stats;

  const isLimitReached = !canCreateListing;
  const isNearLimit =
    remainingListings !== null &&
    remainingListings <= 2 &&
    remainingListings > 0;

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "flex items-start gap-3 rounded-xl border p-4 text-sm",
          isLimitReached
            ? "border-red-200 bg-red-50 text-red-700 dark:bg-red-950/50 dark:border-red-800 dark:text-red-400"
            : isNearLimit
              ? "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-400"
              : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-400",
        )}
      >
        {isLimitReached ? (
          <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
        ) : isNearLimit ? (
          <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
        ) : (
          <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0" />
        )}

        <div className="space-y-1">
          {isLimitReached ? (
            <>
              <p className="font-medium">Listing limit reached</p>
              <p className="text-xs opacity-90">
                You’ve reached your maximum listings. Upgrade your plan to add
                more services.
              </p>
            </>
          ) : isNearLimit ? (
            <>
              <p className="font-medium">Almost at your limit</p>
              <p className="text-xs opacity-90">
                You can create {remainingListings} more listing
                {remainingListings === 1 ? "" : "s"}.
              </p>
            </>
          ) : (
            <>
              <p className="font-medium">You can create listings</p>
              <p className="text-xs opacity-90">
                {remainingListings ?? "Unlimited"} listings remaining.
              </p>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <StatCard
          icon={Package}
          label="Listings"
          value={totalProducts}
          sub={maxListings ? `${remainingListings} left` : "Unlimited"}
        />

        <StatCard icon={Calendar} label="Bookings" value={totalBookings} />

        <StatCard
          icon={DollarSign}
          label="Revenue"
          value={`$${totalRevenue}`}
        />

        <StatCard
          icon={Star}
          label="Rating"
          value={avgRating ?? "—"}
          sub={`${totalReviews} reviews`}
        />

        <StatCard
          icon={CheckCircle2}
          label="Status"
          value={canCreateListing ? "Active" : "Limited"}
        />

        <StatCard
          icon={AlertTriangle}
          label="Limit Status"
          value={
            isLimitReached ? "Limit Reached" : isNearLimit ? "Near Limit" : "OK"
          }
        />
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>

      <p className="text-lg font-semibold text-foreground">{value}</p>

      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}
