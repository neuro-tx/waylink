"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Info,
  LucideIcon,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardInsight, InsightVariant } from "@/lib/admin-types";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const variantStyles: Record<
  InsightVariant,
  { bg: string; border: string; text: string; icon: string; Icon: LucideIcon }
> = {
  success: {
    bg: "bg-[oklch(0.97_0.04_150)] dark:bg-[oklch(0.22_0.05_150)]",
    border: "border-[oklch(0.85_0.1_150)] dark:border-[oklch(0.35_0.08_150)]",
    text: "text-[oklch(0.35_0.1_150)] dark:text-[oklch(0.85_0.08_150)]",
    icon: "text-[oklch(0.55_0.15_150)] dark:text-[oklch(0.7_0.15_150)]",
    Icon: TrendingUp,
  },
  warning: {
    bg: "bg-[oklch(0.97_0.05_85)] dark:bg-[oklch(0.24_0.06_85)]",
    border: "border-[oklch(0.85_0.12_85)] dark:border-[oklch(0.4_0.1_85)]",
    text: "text-[oklch(0.4_0.1_85)] dark:text-[oklch(0.85_0.1_85)]",
    icon: "text-[oklch(0.6_0.16_85)] dark:text-[oklch(0.75_0.16_85)]",
    Icon: AlertTriangle,
  },
  critical: {
    bg: "bg-[oklch(0.97_0.04_25)] dark:bg-[oklch(0.24_0.07_25)]",
    border: "border-[oklch(0.85_0.12_25)] dark:border-[oklch(0.4_0.1_25)]",
    text: "text-[oklch(0.4_0.12_25)] dark:text-[oklch(0.85_0.08_25)]",
    icon: "text-[oklch(0.55_0.18_25)] dark:text-[oklch(0.7_0.18_25)]",
    Icon: TrendingDown,
  },
  info: {
    bg: "bg-[oklch(0.97_0.02_250)] dark:bg-[oklch(0.24_0.03_250)]",
    border: "border-[oklch(0.87_0.05_250)] dark:border-[oklch(0.4_0.06_250)]",
    text: "text-[oklch(0.4_0.06_250)] dark:text-[oklch(0.85_0.04_250)]",
    icon: "text-[oklch(0.55_0.1_250)] dark:text-[oklch(0.7_0.1_250)]",
    Icon: Info,
  },
};

export function InsightsTrigger() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const open = searchParams.get("insights") === "true";

  function setOpen(value: boolean) {
    const params = new URLSearchParams(searchParams);

    if (value) {
      params.set("insights", "true");
    } else {
      params.delete("insights");
    }

    const query = params.toString();

    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="relative gap-2"
      >
        <Sparkles className="h-4 w-4" />
        Show Insights
      </Button>

      <InsightsPanel open={open} onOpenChange={setOpen} />
    </>
  );
}

function InsightsPanel({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [insights, setInsights] = useState<DashboardInsight[]>([]);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!open || status === "success") return;

    const controller = new AbortController();

    const load = async () => {
      setStatus("loading");
      setError(null);

      try {
        const res = await fetch("/api/admin/insights", {
          signal: controller.signal,
        });
        const json = await res.json();

        if (!res.ok) throw new Error("Failed to load insights.");

        setInsights(json.data);
        setStatus("success");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setStatus("error");
        const errMess =
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.";
        setError(errMess);
      }
    };

    load();

    return () => controller.abort();
  }, [open, retryKey]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0">
        <SheetHeader className="border-b px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-base">Platform Insights</SheetTitle>
              <SheetDescription className="text-xs">
                What's happening across your platform right now
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <AnimatePresence mode="wait" initial={false}>
          {status === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <InsightsSkeleton />
            </motion.div>
          )}

          {status === "error" && error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <InsightsErrorState
                error={error}
                onRetry={() => setRetryKey((k) => k + 1)}
              />
            </motion.div>
          )}

          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <InsightsView insights={insights} />
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
}

function InsightsView({ insights }: { insights: DashboardInsight[] }) {
  const shouldReduceMotion = useReducedMotion();
  const isEmpty = insights.length === 0;

  const summary = useMemo(() => {
    return insights.reduce(
      (acc, insight) => {
        acc.total++;
        acc[insight.variant]++;
        return acc;
      },
      {
        total: 0,
        success: 0,
        warning: 0,
        critical: 0,
        info: 0,
      },
    );
  }, [insights]);

  return (
    <div
      className={cn(
        "flex flex-col h-full gap-2 overflow-y-auto p-4",
        isEmpty && "h-[calc(100dvh-200px)] justify-center",
      )}
    >
      {!isEmpty && (
        <div className="mb-2 border-b pb-2">
          <div className="flex flex-nowrap gap-1.5">
            {summary.critical > 0 && (
              <Badge
                variant="outline"
                className="border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
              >
                {summary.critical} Critical
              </Badge>
            )}

            {summary.warning > 0 && (
              <Badge
                variant="outline"
                className="border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
              >
                {summary.warning} Warning
              </Badge>
            )}

            {summary.success > 0 && (
              <Badge
                variant="outline"
                className="border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
              >
                {summary.success} Success
              </Badge>
            )}

            {summary.info > 0 && (
              <Badge
                variant="outline"
                className="border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300"
              >
                {summary.info} Info
              </Badge>
            )}
          </div>
        </div>
      )}

      <AnimatePresence mode="popLayout">
        {isEmpty ? (
          <div className="flex min-h-75 flex-col items-center justify-center rounded-xl border border-dashed bg-linear-to-b from-muted/40 via-background to-background px-6 py-12 text-center">
            <svg
              viewBox="0 0 180 140"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-30"
            >
              <rect
                x="35"
                y="20"
                width="110"
                height="80"
                rx="12"
                className="fill-muted stroke-border"
                strokeWidth="1.5"
              />
              <path
                d="M52 66L72 54L92 62L112 42L128 50"
                className="stroke-emerald-600"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect
                x="56"
                y="76"
                width="8"
                height="12"
                rx="2"
                className="fill-sky-500/30"
              />
              <rect
                x="72"
                y="70"
                width="8"
                height="18"
                rx="2"
                className="fill-sky-500/50"
              />
              <rect
                x="88"
                y="62"
                width="8"
                height="26"
                rx="2"
                className="fill-sky-500/70"
              />
              <path
                d="M25 34L28 28L31 34L37 37L31 40L28 46L25 40L19 37L25 34Z"
                className="fill-amber-500"
              />
              <path
                d="M146 18L148 14L150 18L154 20L150 22L148 26L146 22L142 20L146 18Z"
                className="fill-amber-500/40"
              />
              <circle
                cx="140"
                cy="104"
                r="5"
                className="fill-amber-400/50 dark:fill-amber-300/60"
              />
              <circle
                cx="38"
                cy="108"
                r="3"
                className="fill-yellow-400/50 dark:fill-yellow-300/60"
              />
            </svg>

            <h3 className="text-lg font-semibold tracking-tight font-mono">
              Everything looks great
            </h3>

            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              There are no important insights to show right now. We'll
              automatically surface trends, opportunities, and issues as new
              data becomes available.
            </p>
          </div>
        ) : (
          insights.map((insight, i) => {
            const s = variantStyles[insight.variant];
            const Icon = s.Icon;

            return (
              <motion.div
                key={insight.id}
                initial={
                  shouldReduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: 12, scale: 0.98 }
                }
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{
                  duration: 0.35,
                  delay: shouldReduceMotion ? 0 : i * 0.06,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-4 transition-colors",
                  s.bg,
                  s.border,
                )}
              >
                <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", s.icon)} />
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn("text-sm font-semibold", s.text)}>
                      {insight.title}
                    </p>
                    {insight.value && (
                      <span
                        className={cn(
                          "text-sm font-semibold tabular-nums",
                          s.text,
                        )}
                      >
                        {insight.value}
                      </span>
                    )}
                  </div>
                  <p className={cn("text-xs opacity-80", s.text)}>
                    {insight.description}
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
      </AnimatePresence>
    </div>
  );
}

function InsightsSkeleton() {
  return (
    <div className="flex flex-col gap-2 px-4 py-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-4">
          <div className="flex items-start gap-3">
            <Skeleton className="mt-1 h-5 w-5 rounded-full" />

            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-4 w-12" />
              </div>

              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function InsightsErrorState({
  error,
  onRetry,
}: {
  error: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex min-h-100 flex-col items-center justify-center rounded-xl border border-dashed px-6 text-center">
      <svg viewBox="0 0 180 140" className="h-36 w-44" fill="none">
        <rect
          x="35"
          y="20"
          width="110"
          height="80"
          rx="12"
          className="fill-muted stroke-border"
          strokeWidth="1.5"
        />

        <path
          d="M55 78L78 60L96 69L120 45"
          stroke="#ef4444"
          strokeWidth="3"
          strokeLinecap="round"
        />

        <circle cx="120" cy="45" r="5" fill="#ef4444" />

        <path
          d="M150 25l8 8m0-8l-8 8"
          stroke="#f59e0b"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        <circle cx="42" cy="110" r="3" fill="#f59e0b" />
      </svg>

      <h3 className="mt-6 text-lg font-semibold">Couldn't load insights</h3>

      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{error}</p>

      {onRetry && (
        <Button className="mt-6" variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
