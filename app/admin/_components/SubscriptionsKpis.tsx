import type { SubscriptionsAnalytics } from "@/lib/admin-types";
import { fmtCurrency } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  Users,
  DollarSign,
  BarChart2,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export function SubscriptionsKpis({
  analytics,
}: {
  analytics: SubscriptionsAnalytics;
}) {
  const kpis = [
    {
      label: "Total subscriptions",
      value: analytics.totalSubscriptions.toLocaleString(),
      icon: Users,
      iconClass: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Active",
      value: analytics.activeCount.toLocaleString(),
      icon: BarChart2,
      iconClass: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Trialing",
      value: analytics.trialingCount.toLocaleString(),
      icon: TrendingUp,
      iconClass: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "MRR",
      value: fmtCurrency(analytics.mrr),
      icon: DollarSign,
      iconClass: "text-violet-600 dark:text-violet-400",
    },
    {
      label: "Trial conversion",
      value: `${analytics.trialConversionRate}%`,
      icon: TrendingUp,
      iconClass: "text-emerald-600 dark:text-emerald-400",
      delta: {
        value: analytics.trialConversionRate,
        up: analytics.trialConversionRate >= 50,
      },
    },
    {
      label: "Churn rate",
      value: `${analytics.churnRate}%`,
      icon: XCircle,
      iconClass: "text-red-600 dark:text-red-400",
      delta: {
        value: analytics.churnRate,
        up: false,
      },
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div key={kpi.label} className="rounded-md bg-card/50 p-4 border space-y-2">
            <div className=" space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {kpi.label}
                </span>
                <div className={cn(kpi.iconClass)}>
                  <Icon className={cn(kpi.iconClass, "size-5")} />
                </div>
              </div>
              <span className="text-2xl font-medium leading-none text-foreground">
                {kpi.value}
              </span>
            </div>

            {kpi.delta && (
              <div className="flex items-center">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-xs font-medium",
                    kpi.delta.up
                      ? "border-emerald-200 text-emerald-700 dark:border-emerald-900  dark:text-emerald-400"
                      : "border-red-200 text-red-700 dark:border-red-900 dark:text-red-400",
                  )}
                >
                  {kpi.delta.up ? (
                    <ArrowUpRight className="size-3" />
                  ) : (
                    <ArrowDownRight className="size-3" />
                  )}
                  {kpi.delta.value}%
                </span>

                <span className="ml-2 text-xs text-muted-foreground">
                  {kpi.delta.up ? "Performing well" : "Needs attention"}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
