"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  X,
  Loader2,
  AlertCircle,
  RefreshCw,
  Users,
  CheckCircle2,
  Ban,
  PauseCircle,
  Clock3,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, fmtDate } from "@/lib/utils";
import { PieChart, Pie, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Subscription, SubscriptionStatus } from "@/lib/all-types";
import { getPlanSubscriptionsData } from "@/controllers/subscriptions.controller";

type PlanStats = {
  total: number;
  active: number;
  trial: number;
  paused: number;
  cancelled: number;
  expired: number;
  autoRenewPct: number;
  statusPct: {
    active: number;
    trial: number;
    paused: number;
    cancelled: number;
    expired: number;
  };
};
type Status = "idle" | "loading" | "success" | "error";

const STATUS_META: Record<
  SubscriptionStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  active: {
    label: "Active",
    color: "#1D9E75",
    icon: <CheckCircle2 className="size-3" />,
  },
  trialing: {
    label: "Trialing",
    color: "#378ADD",
    icon: <Clock3 className="size-3" />,
  },
  paused: {
    label: "Paused",
    color: "#EF9F27",
    icon: <PauseCircle className="size-3" />,
  },
  cancelled: {
    label: "Cancelled",
    color: "#E24B4A",
    icon: <Ban className="size-3" />,
  },
  expired: {
    label: "Expired",
    color: "#888780",
    icon: <Clock3 className="size-3" />,
  },
};

const STATUS_BADGE: Record<SubscriptionStatus, string> = {
  active:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  trialing: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  paused: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  cancelled: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  expired: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800/40 dark:text-zinc-400",
};

function KpiCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg bg-card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-muted-foreground/80">{icon}</span>
      </div>
      <span className="text-2xl font-medium leading-none tracking-tight text-foreground tabular-nums">
        {value}
      </span>
    </div>
  );
}

function StatusPieChart({ stats }: { stats: PlanStats | null }) {
  const total = stats?.total ?? 0;

  if (!stats) return null;
  const pieData = [
    { key: "active", name: "Active", value: stats.active, color: "#1D9E75" },
    { key: "trialing", name: "Trialing", value: stats.trial, color: "#378ADD" },
    { key: "paused", name: "Paused", value: stats.paused, color: "#EF9F27" },
    {
      key: "cancelled",
      name: "Cancelled",
      value: stats.cancelled,
      color: "#E24B4A",
    },
    { key: "expired", name: "Expired", value: stats.expired, color: "#888780" },
  ];

  const chartConfig = Object.fromEntries(
    pieData.map((d) => [d.key, { label: d.name, color: d.color }]),
  ) satisfies ChartConfig;

  if (pieData.length === 0) return null;

  return (
    <div className="rounded-lg border border-border/50 bg-card p-4">
      <p className="text-sm font-medium text-foreground mb-1">
        Status breakdown
      </p>
      <p className="text-xs text-muted-foreground mb-3">
        Distribution across all subscription states
      </p>
      <div className="flex items-center gap-4">
        <ChartContainer config={chartConfig} className="h-30 w-30 shrink-0">
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={34}
              outerRadius={52}
              strokeWidth={0}
            >
              {pieData.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => (
                    <div className="flex items-center justify-between gap-6 min-w-35 py-1">
                      <span className="text-xs">{name}</span>
                      <div className="flex items-center gap-1.5 font-medium tabular-nums">
                        <span>{value as number}</span>
                        <span className="text-muted-foreground">
                          (
                          {total > 0
                            ? Math.round(((value as number) / total) * 100)
                            : 0}
                          %)
                        </span>
                      </div>
                    </div>
                  )}
                />
              }
            />
          </PieChart>
        </ChartContainer>

        <div className="flex flex-col gap-2 flex-1">
          {pieData.map((d) => {
            const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
            return (
              <div
                key={d.key}
                className="flex items-center gap-2 text-xs text-muted-foreground"
              >
                <span
                  className="inline-block h-2 w-2 rounded-sm shrink-0"
                  style={{ background: d.color }}
                />
                <span>{d.key}</span>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-foreground font-medium">{d.value}</span>
                  <span className="text-muted-foreground/60">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SubRow({ sub }: { sub: Subscription }) {
  const meta = STATUS_META[sub.status];
  return (
    <div className="flex items-center gap-3 py-2.5 px-3 border-b border-border/40 last:border-0 hover:bg-muted/50">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          ID: {sub.id}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {sub.type === "trial" ? "Trial" : "Paid"} · {fmtDate(sub.startDate)}
          {" → "}
          {fmtDate(sub.endDate)}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-muted-foreground tabular-nums">
          {sub.listingsCount} listings
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
            STATUS_BADGE[sub.status],
          )}
        >
          {meta.icon}
          {meta.label}
        </span>
      </div>
    </div>
  );
}

export function PlanSubscriptionsPanel() {
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  const planId = params.get("plan")?.trim();
  const planName = params.get("name")?.trim();

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<Subscription[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [stats, setStats] = useState<PlanStats | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (planId) {
      setVisible(true);
    } else {
      setVisible(false);
      setStatus("idle");
    }
  }, [planId]);

  useEffect(() => {
    if (visible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [visible]);

  useEffect(() => {
    if (!planId) return;
    let cancelled = false;

    const fetchData = async () => {
      setStatus("loading");
      setError(null);
      try {
        const res = await getPlanSubscriptionsData(planId, 10, 0);
        if (cancelled) return;
        if (!res.success) throw new Error("Failed to load plan subscriptions.");

        setData(res.data as Subscription[]);
        setStats(res.stats as PlanStats);
        setHasMore(res?.hasMore);
        setOffset(10);
        setStatus("success");
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load plan subscriptions.",
        );

        setStatus("error");
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [planId, attempt]);

  function handleClose() {
    setVisible(false);
    setTimeout(() => router.push(path), 250);
  }

  const loadMore = async () => {
    if (!hasMore || status === "loading") return;

    setLoadingMore(true);

    const res = await getPlanSubscriptionsData(planId!, 10, offset);

    if (res.success) {
      setData((prev) => [...prev, ...res.data]);
      setHasMore(res.hasMore);
      setOffset((prev) => prev + 10);
      setStats(res.stats as PlanStats);
    }

    setLoadingMore(false);
  };

  if (!planId) return null;

  const activeCount = stats?.active ?? 0;
  const trialCount = stats?.trial ?? 0;
  const autoRenewPct = stats?.autoRenewPct ?? 0;
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex-col justify-end transition-all duration-300",
        visible ? "opacity-100" : "opacity-0 pointer-events-none",
      )}
      aria-modal="true"
      role="dialog"
      aria-label="Plan subscriptions"
    >
      <div className="absolute inset-0 bg-background/50 backdrop-blur-xs" />

      <div
        ref={panelRef}
        className={cn(
          "relative ml-auto z-10 w-full md:w-130 h-screen flex flex-col",
          "bg-background border-l rounded-l-xl shadow-2xl",
          "transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          visible ? "translate-y-0" : "translate-y-full",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>

        <div className="flex items-center justify-between px-6 py-3 border-b border-border/50 shrink-0">
          <div>
            <h2 className="text-base font-medium text-foreground">
              {planName ? planName : "Plan subscriptions"}
            </h2>
            {status === "success" && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {data.length} subscription{data.length !== 1 ? "s" : ""} on this
                plan
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={handleClose}
          >
            <X className="size-4" />
            <span className="sr-only">Close panel</span>
          </Button>
        </div>

        <ScrollArea className="flex-1 overflow-y-auto p-3">
          {status === "loading" && (
            <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
              <Loader2 className="size-4 animate-spin" />
              <span className="text-sm">Loading subscriptions…</span>
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
                <button
                  className="ml-2 flex items-center gap-1 text-xs underline-offset-2 hover:underline"
                  onClick={() => setAttempt((n) => n + 1)}
                >
                  <RefreshCw className="size-3" />
                  Retry
                </button>
              </div>
            </div>
          )}

          {status === "success" && data && (
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-2">
                <KpiCard
                  label="Total"
                  value={stats?.total ?? 0}
                  icon={<Users className="size-4 text-blue-500" />}
                />

                <KpiCard
                  label="Active"
                  value={activeCount}
                  icon={<CheckCircle2 className="size-4 text-emerald-500" />}
                />

                <KpiCard
                  label="On trial"
                  value={trialCount}
                  icon={<Clock3 className="size-4 text-amber-500" />}
                />

                <KpiCard
                  label="Auto-renew"
                  value={`${autoRenewPct}%`}
                  icon={<TrendingUp className="size-4 text-violet-500" />}
                />
              </div>

              <Separator />

              <div className="flex flex-col gap-3">
                <StatusPieChart stats={stats} />

                <div className="rounded-lg border border-border/50 bg-card px-0 py-2">
                  <p className="text-sm font-medium text-foreground py-2 px-3 border-b border-border/40 mb-1">
                    Subscriptions
                  </p>
                  {data.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-10 px-3 text-muted-foreground">
                      <Users className="size-6 opacity-30" />
                      <span className="text-sm">
                        No subscriptions on this plan yet.
                      </span>
                    </div>
                  ) : (
                    data.map((sub) => <SubRow key={sub.id} sub={sub} />)
                  )}
                </div>
                {hasMore && (
                  <Button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="w-fit"
                    size="sm"
                    variant="outline"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="size-4 animate-spin mr-2" />
                        Loading...
                      </>
                    ) : (
                      "Load more"
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
