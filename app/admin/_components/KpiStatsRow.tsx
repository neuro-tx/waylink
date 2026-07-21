"use client";

import {
  DollarSign,
  Repeat,
  CalendarCheck,
  Users,
  Package,
  ShieldAlert,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { DashboardKpis } from "@/lib/admin-types";
import { DateRange } from "@/lib/panel-types";
import CountUpMotion from "@/components/CountUpMotion";

type Tone = "default" | "warning";

export function KpiStatsRow({ range }: { range: DateRange }) {
  const kpis: DashboardKpis = {
    // Revenue
    totalRevenue: 248750.45,
    revenueTrendPct: 18.6,

    // Subscriptions
    activeSubscriptions: 187,
    mrr: 32450,

    // Bookings
    totalBookings: 1432,
    bookingsTrendPct: 12.3,

    // Providers
    activeProviders: 96,
    pendingProviderApprovals: 14,

    // Products
    productsLive: 328,
    productsPendingModeration: 21,
  };

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
      <StatCard
        label="Revenue"
        value={kpis.totalRevenue}
        trendPct={kpis.revenueTrendPct}
        icon={DollarSign}
      />
      <StatCard
        label="MRR"
        value={kpis.mrr}
        sublabel={`${kpis.activeSubscriptions} active subs`}
        icon={Repeat}
      />
      <StatCard
        label="Bookings"
        value={kpis.totalBookings}
        trendPct={kpis.bookingsTrendPct}
        icon={CalendarCheck}
      />
      <StatCard
        label="Providers"
        value={kpis.activeProviders}
        sublabel={
          kpis.pendingProviderApprovals > 0
            ? `${kpis.pendingProviderApprovals} pending`
            : undefined
        }
        sublabelTone={kpis.pendingProviderApprovals > 0 ? "warning" : "default"}
        icon={Users}
      />
      <StatCard
        label="Products live"
        value={kpis.productsLive}
        sublabel={
          kpis.productsPendingModeration > 0
            ? `${kpis.productsPendingModeration} to review`
            : undefined
        }
        sublabelTone={
          kpis.productsPendingModeration > 0 ? "warning" : "default"
        }
        icon={Package}
      />
      <StatCard
        label="Needs attention"
        value={kpis.pendingProviderApprovals + kpis.productsPendingModeration}
        sublabel="approvals + reviews"
        icon={ShieldAlert}
        tone={
          kpis.pendingProviderApprovals + kpis.productsPendingModeration > 0
            ? "warning"
            : "default"
        }
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  sublabel,
  sublabelTone = "default",
  trendPct,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: number;
  sublabel?: string;
  sublabelTone?: Tone;
  trendPct?: number;
  icon: LucideIcon;
  tone?: Tone;
}) {
  return (
    <Card
      className={cn(
        "border-border bg-card/50 transition-colors",
        tone === "warning" && "border-amber-500/50 bg-amber-500/5",
      )}
    >
      <CardContent className="flex flex-col gap-1.5 px-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            {label}
          </span>
          <Icon
            className={cn(
              "size-4.5 text-muted-foreground",
              tone === "warning" && "text-amber-500",
            )}
          />
        </div>

        <div className="text-xl md:text-2xl font-semibold tracking-tight">
          <CountUpMotion value={value} />
        </div>

        {(sublabel || typeof trendPct === "number") && (
          <div className="flex items-center gap-1.5 text-xs">
            {trendPct && (
              <span
                className={cn(
                  trendPct >= 0 ? "text-emerald-500" : "text-red-500",
                )}
              >
                {trendPct >= 0 ? "+" : ""}
                {trendPct.toFixed(1)}%
              </span>
            )}
            {sublabel && (
              <span
                className={cn(
                  "text-muted-foreground",
                  sublabelTone === "warning" && "text-amber-500",
                )}
              >
                {sublabel}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
