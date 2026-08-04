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
import { useState } from "react";

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

        <InsightsView insights={insights} />
      </SheetContent>
    </Sheet>
  );
}

function InsightsView({ insights }: { insights: DashboardInsight[] }) {
  const shouldReduceMotion = useReducedMotion();
  const isEmpty = insights.length === 0;

  return (
    <div
      className={cn(
        "flex flex-col gap-2 overflow-y-auto px-4 py-4",
        isEmpty && "h-[calc(100dvh-200px)] justify-center",
      )}
    >
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
