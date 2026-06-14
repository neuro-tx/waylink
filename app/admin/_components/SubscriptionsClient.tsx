"use client";

import { useEffect, useState } from "react";
import { SubscriptionStatus } from "@/lib/all-types";
import { useSearchParams } from "next/navigation";
import { getSubscriptionsData } from "@/controllers/subscriptions.controller";
import { AlertCircle, Loader, RefreshCw } from "lucide-react";
import { SubscriptionsData } from "@/lib/admin-types";
import { SubscriptionsKpis } from "./SubscriptionsKpis";
import { SubscriptionsCharts } from "./charts/SubscriptionsCharts";
import { SubscriptionsTable } from "./SubscriptionsTable";

type Status = "idle" | "loading" | "success" | "error";

const SubscriptionsClient = () => {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const params = useSearchParams();
  const [attempt, setAttempt] = useState(0);
  const [data, setData] = useState<SubscriptionsData | null>(null);
  const [firstLoading, setFirstLoading] = useState(true);

  const filters = {
    status: params.get("status") as SubscriptionStatus | undefined,
    planId: params.get("planId"),
    type: params.get("type") as "trial" | "paid" | undefined,
    page: params.get("page") ? Number(params.get("page")) : 1,
  } as any;

  const filtersKey = JSON.stringify(filters);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setStatus("loading");
      setError(null);

      try {
        const res = await getSubscriptionsData(JSON.parse(filtersKey));
        if (cancelled) return;

        if (!res) {
          setError("Something went wrong, try again.");
          setStatus("error");
          return;
        }

        setData(res);
        setStatus("success");
        setFirstLoading(false);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load data.");
        setStatus("error");
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [filtersKey, attempt]);

  if (status === "idle" || (status === "loading" && firstLoading)) {
    return <LoaderUI />;
  }

  if (status === "error" || !data) {
    return (
      <ErrorMark
        message={error ?? "Something went wrong."}
        onRetry={() => setAttempt((n) => n + 1)}
      />
    );
  }

  const { subscriptions, analytics, activePlans } = data;

  return (
    <div className="space-y-5">
      <SubscriptionsKpis analytics={analytics} />
      <SubscriptionsCharts analytics={analytics} />
      <SubscriptionsTable
        data={subscriptions.data}
        total={subscriptions.total}
        page={subscriptions.page}
        totalPages={subscriptions.totalPages}
        activePlans={activePlans}
        filters={filters}
      />
    </div>
  );
};

function LoaderUI() {
  return (
    <div className="flex h-[70dvh] items-center justify-center py-20 text-muted-foreground">
      <Loader className="h-5 w-5 animate-spin mr-2" />
      <span className="text-sm">Loading subscriptions…</span>
    </div>
  );
}

function ErrorMark({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>{message}</span>
        <button
          onClick={onRetry}
          className="ml-2 flex items-center gap-1 text-xs underline-offset-2 hover:underline"
        >
          <RefreshCw className="h-3 w-3" />
          Retry
        </button>
      </div>
    </div>
  );
}

export default SubscriptionsClient;
