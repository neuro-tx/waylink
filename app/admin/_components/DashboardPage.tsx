"use client";

import { useEffect, useState } from "react";
import { TopProducts } from "@/app/provider/_components/TopProducts";
import { KpiStatsRow } from "./KpiStatsRow";
import { RevenueBookingsChart } from "./RevenueBookingsChart";
import { TopProviders } from "./TopProviders";
import { PlanTierChart } from "./PlanTierChart";
import { PlanSubscriptions } from "./PlanSubscriptions";
import { BookingsStatusChart } from "./BookingsStatusChart";
import { ErrorState } from "./ErrorState";
import { DashboardResponse, UserStatsData } from "@/lib/admin-types";
import { ServiceStatusChart } from "./ServiceStatusChart";
import UserStatsOverview from "./UserStatsOverview";
import { userAnalysis } from "@/actions/user.actions";
import { Skeleton } from "@/components/ui/skeleton";
import { InsightsTrigger } from "./InsightsTrigger";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [stats, setStats] = useState<UserStatsData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [res, statsRes] = await Promise.all([
          fetch("/api/admin/dashboard"),
          userAnalysis(),
        ]);
        const json = await res.json();

        if (!res.ok || !statsRes.success) {
          throw new Error(json.error ?? "Failed to load dashboard.");
        }

        setResult(json.data.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [retryKey]);

  if (loading) return <DashboardLoader />;
  if (error)
    return (
      <ErrorState
        fullScreen
        error={error}
        onRetry={() => setRetryKey((k) => k + 1)}
      />
    );

  if (!result) return null;

  const { planTier, topProviders, subscriptionOverview } = result.analysis;

  return (
    <div className="space-y-6 px-4 py-6 md:px-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Platform Overview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor platform performance, revenue, bookings, providers, and
            subscriptions from a single overview.
          </p>
        </div>

        <InsightsTrigger />
      </div>

      <KpiStatsRow kpis={result.kpis} />
      <UserStatsOverview data={stats} />

      <RevenueBookingsChart data={result.revenueSeries} />
      <TopProviders providers={topProviders} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <BookingsStatusChart data={result.bookingStatus} />
        <ServiceStatusChart data={result.servicesStatus} />
        <PlanTierChart data={planTier} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 ">
        <PlanSubscriptions data={subscriptionOverview} />
        <TopProducts products={result.topProducts} />
      </div>
    </div>
  );
}

function DashboardLoader() {
  return (
    <div className="space-y-6 px-4 py-6 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56 rounded-md" />
          <Skeleton className="h-4 w-96 max-w-full rounded-md" />
        </div>

        <Skeleton className="h-10 w-44 rounded-xl" />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>

      <Skeleton className="h-120 rounded-xl" />
      <Skeleton className="h-90 rounded-xl" />
      <Skeleton className="h-80 rounded-xl" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-70 rounded-xl" />
        <Skeleton className="h-70 rounded-xl" />
        <Skeleton className="h-70 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  );
}
