"use client";

import { motion } from "motion/react";
import { ArrowRight, Clock, TrendingUp, TrendingDown } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { PayoutSummary } from "@/lib/panel-types";

interface Props {
  payout: PayoutSummary;
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function PayoutSummaryCard({ payout }: Props) {
  const changeUp = payout.periodComparison.changePercent >= 0;
  const absChange = Math.abs(payout.periodComparison.changePercent);

  const rows = [
    {
      label: "Gross earnings",
      value: fmt(payout.grossEarnings),
      muted: false,
      className: "text-card-foreground",
    },
    {
      label: `Platform fee (${(payout.platformFeeRate).toFixed(0)}%)`,
      value: `− ${fmt(payout.platformFeeAmount)}`,
      muted: true,
      className: "text-destructive",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Payout summary</CardTitle>
          <CardDescription className="text-[12px] mt-0.5">
            This period's earnings breakdown
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col gap-0 pb-4">
          {/* Period comparison banner */}
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-[12px] mb-4",
              changeUp
                ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
                : "bg-destructive/8 text-destructive",
            )}
          >
            {changeUp ? (
              <TrendingUp className="size-3.5 shrink-0" />
            ) : (
              <TrendingDown className="size-3.5 shrink-0" />
            )}
            <span>
              Revenue {changeUp ? "up" : "down"}{" "}
              <strong>{absChange.toFixed(1)}%</strong> vs previous period
            </span>
            <span className="ml-auto text-[11px] opacity-70">
              prev. {fmt(payout.periodComparison.previous)}
            </span>
          </div>

          {/* Breakdown rows */}
          <div className="space-y-2.5">
            {rows.map((r) => (
              <div
                key={r.label}
                className="flex items-center justify-between gap-4"
              >
                <span className="text-[13px] text-muted-foreground">
                  {r.label}
                </span>
                <span
                  className={cn(
                    "text-[13px] font-medium tabular-nums",
                    r.className,
                  )}
                >
                  {r.value}
                </span>
              </div>
            ))}
          </div>

          <Separator className="my-3" />

          {/* Net payout — prominent */}
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-card-foreground">
              Net payout
            </span>
            <span className="text-xl font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
              {fmt(payout.netPayout)}
            </span>
          </div>

          {/* Pending */}
          {payout.pendingPayoutAmount > 0 && (
            <div className="mt-3 flex items-center justify-between px-3 py-2 bg-muted/50 rounded-md text-[12px]">
              <span className="text-muted-foreground">Pending payout</span>
              <span className="font-medium text-card-foreground tabular-nums">
                {fmt(payout.pendingPayoutAmount)}
              </span>
            </div>
          )}

          {/* Next payout date */}
          <div className="mt-auto pt-4">
            <div className="flex items-center gap-2 px-3 py-2.5 bg-muted/40 border border-border/60 rounded-md">
              <Clock className="size-3.5 text-muted-foreground shrink-0" />
              <span className="text-[12px] text-muted-foreground flex-1">
                Next payout
              </span>
              <span className="text-[12px] font-medium text-card-foreground">
                {fmtDate(payout.nextPayoutDate)}
              </span>
              <ArrowRight className="size-3 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
