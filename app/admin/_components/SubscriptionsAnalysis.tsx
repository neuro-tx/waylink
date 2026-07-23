"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { TrendingUp, RefreshCcw, Layers, CreditCard } from "lucide-react";
import { Subscription, Plan } from "@/lib/all-types";
import { fmtCurrency } from "@/lib/helpers";

// Types
export interface SubscriptionAnalytics {
  totalSubscriptions: number;
  revenueByPlan: { plan: string; mrr: number; subscriptions: number }[];
  statusBreakdown: { status: string; count: number }[];
  billingSplit: { monthly: number; yearly: number };
  trialConversion: {
    totalTrials: number;
    convertedTrials: number;
    conversionRate: number;
  };
  listingsUsage: { used: number; capacity: number; unlimitedProviders: number };
}

// Mock Data
const subscriptionAnalytics: SubscriptionAnalytics = {
  totalSubscriptions: 246,
  revenueByPlan: [
    { plan: "Enterprise", mrr: 12480, subscriptions: 26 },
    { plan: "Pro", mrr: 8740, subscriptions: 92 },
    { plan: "Growth", mrr: 4210, subscriptions: 68 },
    { plan: "Starter", mrr: 1480, subscriptions: 42 },
    { plan: "Free", mrr: 0, subscriptions: 18 },
  ],
  statusBreakdown: [
    { status: "active", count: 182 },
    { status: "trialing", count: 28 },
    { status: "paused", count: 12 },
    { status: "expired", count: 9 },
    { status: "cancelled", count: 15 },
  ],
  billingSplit: { monthly: 176, yearly: 70 },
  trialConversion: {
    totalTrials: 58,
    convertedTrials: 41,
    conversionRate: 70.7,
  },
  listingsUsage: { used: 1328, capacity: 2180, unlimitedProviders: 11 },
};

// UI Config Maps
const STATUS_UI: Record<string, { color: string; label: string }> = {
  active: { color: "#10b981", label: "Active" }, // Emerald
  trialing: { color: "#3b82f6", label: "Trialing" }, // Blue
  paused: { color: "#f59e0b", label: "Paused" }, // Amber
  cancelled: { color: "#f43f5e", label: "Cancelled" }, // Rose
  expired: { color: "#64748b", label: "Expired" }, // Slate
};

const formatCompactCurrency = (val: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(val);

export function SubscriptionsAnalysis() {
  const {
    billingSplit,
    listingsUsage,
    revenueByPlan,
    statusBreakdown,
    totalSubscriptions,
    trialConversion,
  } = subscriptionAnalytics;

  return (
    <div className="flex flex-col gap-6">
      {/* TOP ROW: Charts & Lists */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* MRR Chart */}
        <Card className="border-none shadow-sm lg:col-span-2 flex flex-col">
          <CardHeader className="pb-2 border-b border-border/50">
            <CardTitle className="text-lg font-bold tracking-tight">
              MRR by Plan
            </CardTitle>
            <CardDescription className="text-sm">
              Monthly recurring revenue from active subs
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pt-6">
            {revenueByPlan.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No revenue data yet.
              </div>
            ) : (
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={revenueByPlan}
                    layout="vertical"
                    margin={{ top: 0, left: 10, right: 20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="mrrGradient"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                      >
                        <stop
                          offset="0%"
                          stopColor="#3b82f6"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="100%"
                          stopColor="#8b5cf6"
                          stopOpacity={1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      horizontal={true}
                      vertical={false}
                      strokeDasharray="4 4"
                      className="stroke-border/50"
                    />
                    <XAxis
                      type="number"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={formatCompactCurrency}
                      tick={{ fontSize: 12, fill: "currentColor" }}
                      className="text-muted-foreground"
                    />
                    <YAxis
                      type="category"
                      dataKey="plan"
                      tickLine={false}
                      axisLine={false}
                      width={85}
                      tick={{
                        fontSize: 13,
                        fontWeight: 500,
                        fill: "currentColor",
                      }}
                      className="text-foreground"
                    />
                    <Tooltip
                      cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="flex min-w-[180px] flex-col gap-2 rounded-xl border border-border/50 bg-background/95 p-3 shadow-xl backdrop-blur-md">
                            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                              {data.plan} Plan
                            </span>
                            <div className="flex flex-col gap-1 mt-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                  MRR
                                </span>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                  {fmtCurrency(data.mrr)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                  Subscribers
                                </span>
                                <span className="font-bold text-foreground">
                                  {data.subscriptions}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }}
                    />
                    {/* Notice the radius is only applied to the right side of the bars */}
                    <Bar
                      dataKey="mrr"
                      fill="url(#mrrGradient)"
                      radius={[0, 4, 4, 0]}
                      barSize={28}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Breakdown */}
        <Card className="border-none shadow-sm flex flex-col">
          <CardHeader className="pb-4 border-b border-border/50">
            <CardTitle className="text-lg font-bold tracking-tight">
              Status Overview
            </CardTitle>
            <CardDescription className="text-sm">
              <span className="font-semibold text-foreground">
                {totalSubscriptions}
              </span>{" "}
              total subscriptions
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pt-6">
            <ul className="flex flex-col gap-3">
              {statusBreakdown.map(({ status, count }) => {
                const ui = STATUS_UI[status] || {
                  color: "#64748b",
                  label: status,
                };
                const percentage = ((count / totalSubscriptions) * 100).toFixed(
                  1,
                );

                return (
                  <li
                    key={status}
                    className="group flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted/40"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-3 w-3 rounded-full shadow-sm"
                        style={{ backgroundColor: ui.color }}
                      />
                      <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                        {ui.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-bold text-foreground w-10 text-right">
                        {count}
                      </span>
                      <span className="w-10 text-right text-[11px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {percentage}%
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* BOTTOM ROW: KPI Progress Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Trial Conversion */}
        <Card className="border-none shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-2 flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Trial Conversion
              </CardTitle>
              <CardDescription className="mt-1 text-xs">
                {trialConversion.convertedTrials} of{" "}
                {trialConversion.totalTrials} converted
              </CardDescription>
            </div>
            <div className="rounded-full bg-blue-500/10 p-2">
              <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-3xl font-bold tracking-tight text-foreground">
                {trialConversion.conversionRate.toFixed(1)}%
              </span>
            </div>
            {/* Custom styled progress bar */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${trialConversion.conversionRate}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Billing Split */}
        <Card className="border-none shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-2 flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Billing Cycle
              </CardTitle>
              <CardDescription className="mt-1 text-xs">
                Monthly vs. Yearly plans
              </CardDescription>
            </div>
            <div className="rounded-full bg-violet-500/10 p-2">
              <RefreshCcw className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-2 flex flex-col justify-end">
            <div className="flex items-center justify-between text-sm mb-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-violet-500" />
                <span className="font-semibold">
                  {billingSplit.yearly} Yearly
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-muted-foreground">
                  {billingSplit.monthly} Monthly
                </span>
                <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
              </div>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-muted-foreground/20">
              <div
                className="h-full bg-violet-500 transition-all duration-500"
                style={{
                  width: `${
                    (billingSplit.yearly /
                      (billingSplit.monthly + billingSplit.yearly)) *
                    100
                  }%`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Listings Usage */}
        <Card className="border-none shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-2 flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Listings Usage
              </CardTitle>
              <CardDescription className="mt-1 text-xs">
                {listingsUsage.unlimitedProviders > 0
                  ? `${listingsUsage.unlimitedProviders} users on uncapped plans`
                  : "Across all capped plans"}
              </CardDescription>
            </div>
            <div className="rounded-full bg-emerald-500/10 p-2">
              <Layers className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-3xl font-bold tracking-tight text-foreground">
                {listingsUsage.used.toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground font-medium">
                /{" "}
                {listingsUsage.capacity > 0
                  ? listingsUsage.capacity.toLocaleString()
                  : "∞"}
              </span>
            </div>
            {listingsUsage.capacity > 0 && (
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{
                    width: `${(listingsUsage.used / listingsUsage.capacity) * 100}%`,
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
