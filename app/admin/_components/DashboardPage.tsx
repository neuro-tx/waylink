"use client";

import { useEffect, useState } from "react";
import { TopProducts } from "@/app/provider/_components/TopProducts";
import { KpiStatsRow } from "./KpiStatsRow";
import { RevenueBookingsChart } from "./RevenueBookingsChart";
import { TopProviders } from "./TopProviders";
import { PlanTierChart } from "./PlanTierChart";
import { PlanSubscriptions } from "./PlanSubscriptions";
import { BookingsStatusChart } from "./BookingsStatusChart";
import { Loader } from "lucide-react";
import { ErrorState } from "./ErrorState";
import { DashboardResponse } from "@/lib/admin-types";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`/api/admin/dashboard`);
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error ?? "Failed to load dashboard.");
        }

        setResult(json.data.data);
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

  return (
    <div className="space-y-6 px-4 py-6 md:px-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          Platform Overview
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitor platform performance, revenue, bookings, providers, and
          subscriptions from a single overview.
        </p>
      </div>

      <KpiStatsRow kpis={result.kpis} />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 items-baseline">
        <div className="flex flex-col gap-6 xl:col-span-2">
          <RevenueBookingsChart data={result.revenueSeries} />
          <TopProducts products={result.topProducts} />
          <TopProviders providers={result.analysis.topProviders} />
        </div>

        <div className="flex flex-col gap-6">
          <PlanTierChart data={result.analysis.planTier} />
          {/* <PlanSubscriptions data={} /> */}
          <BookingsStatusChart data={result.bookingStatus} />
        </div>
      </div>
    </div>
  );
}

function DashboardLoader() {
  return (
    <div className="flex h-[70vh] flex-col items-center justify-center gap-4">
      <Loader className="size-8 animate-spin text-primary" />

      <div className="text-center">
        <h2 className="font-semibold">Loading dashboard</h2>

        <p className="text-sm text-muted-foreground">
          Fetching the latest analytics...
        </p>
      </div>
    </div>
  );
}
