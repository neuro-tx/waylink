"use client";

import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { PlanTier } from "@/lib/all-types";
import { SubscriptionOverview } from "@/lib/admin-types";
import { CreditCard } from "lucide-react";

const TIER_COLORS: Record<PlanTier, { label: string; fill: string }> = {
  free: {
    label: "Free",
    fill: "#9CA3AF",
  },
  pro: {
    label: "Pro",
    fill: "#6366F1",
  },
  business: {
    label: "Business",
    fill: "#10B981",
  },
  enterprise: {
    label: "Enterprise",
    fill: "#F59E0B",
  },
};

export function PlanSubscriptions({ data }: { data: SubscriptionOverview }) {
  const { tierDistribution, totalSubs } = data;
  const formatted = tierDistribution.map((item) => ({
    ...item,
    label: TIER_COLORS[item.tier].label,
    fill: TIER_COLORS[item.tier].fill,
  }));

  return (
    <Card className="border bg-background shadow-sm h-full flex flex-col">
      <CardHeader>
        <div>
          <CardTitle className="font-bold tracking-tight">
            Subscriptions overview
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Distribution across all tiers
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between pt-6">
        {totalSubs === 0 ? (
          <div className="flex h-50 flex-col items-center justify-center rounded-md bg-linear-to-br from-muted/30 via-transparent to-muted/10 px-6">
            <div className="relative mb-6 flex items-center justify-center">
              <div className="absolute -left-12 -rotate-12 rounded-lg border border-indigo-500/15 bg-indigo-500/5 p-2">
                <div className="h-7 w-5 rounded bg-indigo-500/30" />
              </div>

              <div className="absolute -right-12 rotate-12 rounded-lg border border-amber-500/15 bg-amber-500/5 p-2">
                <div className="h-7 w-5 rounded bg-amber-500/30" />
              </div>

              <div className="absolute -top-4 left-2 h-2 w-2 rounded-full bg-emerald-500/30" />
              <div className="absolute -bottom-5 -left-4 h-1.5 w-1.5 rounded-full bg-indigo-500/30" />
              <div className="absolute top-3 -right-5 h-2 w-2 rounded-full bg-amber-500/30" />

              <div className="relative flex size-12 items-center justify-center rounded-full bg-transparent">
                <CreditCard className="size-6 text-indigo-500" />
              </div>
            </div>

            <h3 className="mt-3 text-base font-semibold">
              No subscriptions yet
            </h3>

            <p className="mt-2 max-w-xs text-center text-sm text-muted-foreground">
              Subscription distribution will appear once providers start
              subscribing to your platform plans.
            </p>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-gray-400" />
                <span className="text-xs text-muted-foreground">Free</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-indigo-500" />
                <span className="text-xs text-muted-foreground">Pro</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs text-muted-foreground">Business</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-amber-500" />
                <span className="text-xs text-muted-foreground">
                  Enterprise
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="relative mx-auto flex h-50 w-full items-center justify-center">
              <ResponsiveContainer
                width="100%"
                height="100%"
                className="relative z-10"
              >
                <PieChart>
                  <Tooltip
                    cursor={false}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="flex items-start gap-2 bg-background/50 rounded-md border p-3 shadow-md backdrop-blur-md w-42">
                          <div
                            className="size-3 shrink-0 rounded-full mt-1"
                            style={{ background: data.fill }}
                          />
                          <div className="flex flex-col pr-2">
                            <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                              {data.label}
                            </span>
                            <span className="text-base font-semibold text-foreground">
                              {data.value} users
                            </span>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Pie
                    data={formatted}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={3}
                    stroke="hsl(var(--background))"
                    strokeWidth={3}
                  >
                    {formatted.map((s) => (
                      <Cell
                        key={s.tier}
                        fill={s.fill}
                        className="outline-none"
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="pointer-events-none z-0 absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold tracking-tight text-foreground">
                  {totalSubs}
                </span>
                <span className="text-xs font-semibold uppercase text-muted-foreground">
                  Total Subs
                </span>
              </div>
            </div>

            <div className="w-full">
              <ul className="flex flex-col gap-0.5">
                {formatted.map((s) => (
                  <li
                    key={s.tier}
                    className="group flex items-center justify-between text-sm transition-colors hover:bg-muted/40 rounded-md p-2 -mx-2"
                  >
                    <span className="flex items-center gap-2.5 text-muted-foreground group-hover:text-foreground transition-colors">
                      <span
                        className="size-2.5 rounded-full shadow-sm"
                        style={{ backgroundColor: s.fill }}
                      />
                      <span className="font-medium">{s.label}</span>
                    </span>
                    <span className="font-semibold text-foreground">
                      {s.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
