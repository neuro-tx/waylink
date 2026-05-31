"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { motion } from "motion/react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DateRange } from "@/lib/panel-types";

const PERIODS: { label: string; value: DateRange }[] = [
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
  { label: "1 year", value: "1y" },
];

interface Props {
  current: DateRange;
}

export function AnalyticsHeader({ current }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handlePeriod(p: DateRange) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", p);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-base text-muted-foreground">
          Performance overview for your provider account
        </p>
      </div>

      <div className="flex items-center gap-2">
        {isPending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <RefreshCw className="size-3.5 text-muted-foreground animate-spin" />
          </motion.div>
        )}

        {/* Period segmented control */}
        <div
          role="group"
          aria-label="Select period"
          className="flex items-center bg-muted rounded-lg p-1 gap-0.5"
        >
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => handlePeriod(p.value)}
              disabled={isPending}
              aria-pressed={current === p.value}
              className={cn(
                "relative text-[12px] font-medium px-3 py-1.5 rounded-md cursor-pointer",
                "transition-colors duration-150 disabled:opacity-50",
                current === p.value
                  ? "bg-card text-card-foreground shadow-sm"
                  : "text-muted-foreground hover:text-card-foreground",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
