"use client";

import {
  Bar,
  ComposedChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { fmtCurrency } from "@/lib/helpers";
import { PlanTierData } from "@/lib/admin-types";
import { BarChart3 } from "lucide-react";

const chartConfig = {
  totalRevenue: {
    label: "Total Revenue ($)",
    color: "#10B981",
  },
  totalCommission: {
    label: "Total Commission ($)",
    color: "#F59E0B",
  },
  bookingsCount: {
    label: "Bookings",
    color: "#3B82F6",
  },
} satisfies ChartConfig;

export function PlanTierChart({ data }: { data: PlanTierData[] }) {
  const isEmpty = data.length === 0;

  return (
    <Card className="w-full bg-background">
      <CardHeader>
        <CardTitle>Plan Tier Performance</CardTitle>
        <CardDescription>
          Analyzing revenue, commissions, and bookings across subscription
          tiers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="flex h-80 flex-col items-center justify-center rounded-md bg-linear-to-br from-background via-muted/20 to-background px-6">
            <div className="relative mb-6 flex h-28 w-44 items-end justify-center gap-2">
              <div className="h-10 w-5 rounded-t-md bg-emerald-500/25" />
              <div className="h-16 w-5 rounded-t-md bg-emerald-500/35" />
              <div className="h-24 w-5 rounded-t-md bg-emerald-500/45" />
              <div className="h-14 w-5 rounded-t-md bg-amber-500/35" />
              <div className="h-20 w-5 rounded-t-md bg-blue-500/40" />

              <svg
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 176 112"
                fill="none"
              >
                <path
                  d="M8 88 C40 70 60 78 84 48 S136 36 168 18"
                  stroke="#3B82F6"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.35"
                />
              </svg>
            </div>

            <h3 className="text-base font-semibold">No analytics available</h3>

            <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
              Revenue trends, bookings, and performance metrics will appear here
              once your platform starts generating activity.
            </p>

            <div className="mt-6 flex items-center gap-5 text-xs">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground">Revenue</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-amber-500" />
                <span className="text-muted-foreground">Commission</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-blue-500" />
                <span className="text-muted-foreground">Bookings</span>
              </div>
            </div>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="min-h-90 w-full">
            <ComposedChart
              data={data}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />

              <XAxis
                dataKey="tier"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) =>
                  value.charAt(0).toUpperCase() + value.slice(1)
                }
              />

              <YAxis
                yAxisId="left"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => fmtCurrency(value)}
              />

              <YAxis
                yAxisId="right"
                orientation="right"
                tickLine={false}
                axisLine={false}
              />

              <ChartTooltip
                cursor={{ fill: "rgba(0,0,0,0.05)" }}
                content={<ChartTooltipContent />}
              />
              <ChartLegend content={<ChartLegendContent />} />

              <Bar
                yAxisId="left"
                dataKey="totalRevenue"
                fill="var(--color-totalRevenue)"
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
                fillOpacity={0.9}
                // maxBarSize={44}
              />
              <Bar
                yAxisId="left"
                dataKey="totalCommission"
                fill="var(--color-totalCommission)"
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
                fillOpacity={0.8}
                // maxBarSize={44}
              />

              <Line
                yAxisId="right"
                type="monotone"
                dataKey="bookingsCount"
                stroke="var(--color-bookingsCount)"
                strokeWidth={3}
                dot={{ r: 4, fill: "var(--color-bookingsCount)" }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
