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
  return (
    <Card className="w-full bg-card/50">
      <CardHeader>
        <CardTitle>Plan Tier Performance</CardTitle>
        <CardDescription>
          Analyzing revenue, commissions, and bookings across subscription
          tiers.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
