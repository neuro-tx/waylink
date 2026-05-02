import { Suspense } from "react";

import { KPICards } from "./_components/KPICards";
import { RecentBookings } from "./_components/RecentBookings";
import { DateRangeTabs } from "./_components/DateRangeTabs";
import { RevenueChart } from "./_components/charts/RevenueChart";
import { TopProducts } from "./_components/TopProducts";
import { StatusPieChart } from "./_components/charts/StatusPieChart";
import { ProviderOverview } from "./_components/ProviderOverview";
import { Skeleton } from "@/components/ui/skeleton";
import { DateRange } from "@/lib/panel-types";
import { AlertTriangle, Inbox } from "lucide-react";
import { getDashboardDataController } from "@/controllers/providerBoard.controller";

export default async function ProviderDashboard({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const typedRange = (range as DateRange) || "30d";

  return (
    <div className="flex-1 space-y-6 py-6 w-full md:px-6 px-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of your transport and experience performance.
          </p>
        </div>
        <DateRangeTabs />
      </div>

      <Suspense key={typedRange} fallback={<DashboardSkeleton />}>
        <DashboardContent range={typedRange} />
      </Suspense>
    </div>
  );
}

async function DashboardContent({ range }: { range: DateRange }) {
  try {
    const resData = await getDashboardDataController(range);

    if (!resData) {
      return (
        <DashboardState
          title="No data available"
          description={`We couldn't find any data for the selected "${range}" period.`}
        />
      );
    }

    const {
      stats,
      kpis,
      revenueTimeSeries,
      bookingStatusBreakdown,
      recentBookings,
      topProducts,
    } = resData;

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <ProviderOverview stats={stats} />
        <KPICards kpis={kpis} />

        <div className="grid gap-4 lg:grid-cols-2">
          <RevenueChart data={revenueTimeSeries} />
          <StatusPieChart data={bookingStatusBreakdown} />
        </div>

        <div className="grid gap-4 items-start md:grid-cols-1 lg:grid-cols-2">
          <RecentBookings bookings={recentBookings} />
          <TopProducts products={topProducts} />
        </div>
      </div>
    );
  } catch (err: any) {
    console.error("Dashboard error:", err);
    return (
      <DashboardState
        variant="error"
        title="Failed to load dashboard"
        description={
          err?.message ||
          "An unexpected error occurred while loading the dashboard."
        }
      />
    );
  }
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Skeleton className="h-28 col-span-2 rounded-xl" />
        <Skeleton className="h-28 col-span-3 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-75 rounded-xl" />
        <Skeleton className="h-75 rounded-xl" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-100 rounded-xl" />
        <Skeleton className="h-100 rounded-xl" />
      </div>
    </div>
  );
}

export function DashboardState({
  title,
  description,
  variant = "empty",
}: {
  title: string;
  description?: string;
  variant?: "error" | "empty";
}) {
  const isError = variant === "error";

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 animate-in fade-in duration-500">
      <div
        className={`rounded-full p-4 ${
          isError
            ? "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {isError ? (
          <AlertTriangle className="size-6" aria-hidden="true" />
        ) : (
          <Inbox className="size-6" aria-hidden="true" />
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
