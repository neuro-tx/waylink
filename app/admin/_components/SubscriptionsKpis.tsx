import type { SubscriptionsAnalytics } from "@/lib/admin-types";
import { fmtCurrency } from "@/lib/helpers";
import {
  TrendingUp,
  Users,
  DollarSign,
  BarChart2,
  XCircle,
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
      delta: null,
    },
    {
      label: "Active",
      value: analytics.activeCount.toLocaleString(),
      icon: BarChart2,
      delta: null,
    },
    {
      label: "Trialing",
      value: analytics.trialingCount.toLocaleString(),
      icon: BarChart2,
      delta: null,
    },
    {
      label: "MRR",
      value: fmtCurrency(analytics.mrr),
      icon: DollarSign,
      delta: null,
    },
    {
      label: "Trial conversion",
      value: `${analytics.trialConversionRate}%`,
      icon: TrendingUp,
      delta: {
        value: analytics.trialConversionRate,
        up: analytics.trialConversionRate >= 50,
      },
    },
    {
      label: "Churn rate",
      value: `${analytics.churnRate}%`,
      icon: XCircle,
      delta: { value: analytics.churnRate, up: false },
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div
            key={kpi.label}
            className="rounded-xl bg-muted/50 px-4 py-3 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{kpi.label}</span>
              <Icon className="h-3.5 w-3.5 text-muted-foreground/60" />
            </div>
            <span className="text-2xl font-medium leading-none text-foreground">
              {kpi.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
