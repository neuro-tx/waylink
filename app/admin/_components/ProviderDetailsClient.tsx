"use client";
import { getProviderDetails } from "@/actions/provider.action";
import { useState, useEffect } from "react";
import { TopHeader } from "./TopHeader";
import { RevenueAnalytics } from "./charts/Revenueanalytics";
import { ProviderInvites } from "@/components/ProviderInvites";
import { ProviderMembers } from "@/components/Providermembers";
import { ServiceStatusChart } from "./StatusCharts";
import { StatusPieChart } from "@/app/provider/_components/charts/StatusPieChart";
import { Loader2 } from "lucide-react";
import { ErrorState } from "./ErrorState";

type Stats = "success" | "error" | "loading" | "idle";
type ProviderDetails = Awaited<ReturnType<typeof getProviderDetails>>;

const ProviderDetailsClient = ({ providerId }: { providerId: string }) => {
  const [stats, setStats] = useState<Stats>("idle");
  const [error, setError] = useState<unknown | null>(null);
  const [details, setDetails] = useState<ProviderDetails | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const getData = async () => {
      setStats("loading");
      setError(null);
      try {
        const result = await getProviderDetails(providerId);

        setDetails(result);
        setStats("success");
      } catch (error) {
        setError(error);
        setStats("error");
      }
    };

    getData();
  }, [retryKey]);

  if (stats === "loading") {
    return (
      <div className="flex min-h-[90svh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-8 animate-spin text-primary" />
          <div className="space-y-1 text-center">
            <h2 className="font-medium">Loading provider details...</h2>
            <p className="text-sm text-muted-foreground">
              Fetching analytics, members, services and revenue.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (stats === "error") {
    return (
      <ErrorState
        title="Failed to load provider details"
        description="An unexpected error occurred while fetching the provider information. Reload the page to try again."
        fullScreen
        error={error}
        onRetry={() => setRetryKey((k) => k + 1)}
      />
    );
  }

  if (!details) return null;

  const { bookingStatus, data, revenue, servicesStatus } = details;
  const { provider, members, invites, status: providerStatus } = data;

  return (
    <div className="w-full overflow-x-hidden px-3 py-6 md:px-6">
      <div className="space-y-5">
        <TopHeader provider={provider} stats={providerStatus ?? null} />
        <RevenueAnalytics data={revenue} />
        <ProviderInvites hideAction invites={invites} />
        <ProviderMembers members={members} />
        <ServiceStatusChart data={servicesStatus} />
        <StatusPieChart data={bookingStatus} />
      </div>
    </div>
  );
};

export default ProviderDetailsClient;
