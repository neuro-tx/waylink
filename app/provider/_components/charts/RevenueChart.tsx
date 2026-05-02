"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
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
import { RevenueDataPoint } from "@/lib/panel-types";
import { Activity } from "lucide-react";
import { useProviderContext } from "@/components/providers/ProviderContext";

export function RevenueChart({ data }: { data: RevenueDataPoint[] }) {
  const { config } = useProviderContext();
  const baseColr = config?.themeColor || "blue";
  const formattedData = useMemo(() => {
    return data.map((d) => ({
      ...d,
      dateFormatted: new Date(d.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    }));
  }, [data]);

  const formatCompactCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(val);

  const formatFullCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(val);

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle>Revenue Trends</CardTitle>
        <CardDescription>
          Activity and revenue patterns over time.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {formattedData.length > 0 ? (
          <div className="h-55 w-full">
            <ResponsiveContainer>
              <AreaChart
                data={formattedData}
                margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={baseColr} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={baseColr} stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  className="stroke-border/50"
                />

                <XAxis
                  dataKey="dateFormatted"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  minTickGap={20}
                  tick={{ fill: baseColr, fontSize: 15, fontWeight: "500" }}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  width={55}
                  tickFormatter={formatCompactCurrency}
                  tick={{ fill: baseColr, fontSize: 15, fontWeight: "500" }}
                />

                <Tooltip
                  cursor={{
                    stroke: baseColr,
                    strokeWidth: 1,
                    strokeDasharray: "4 4",
                  }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;

                    return (
                      <div className="rounded-xl border border-border/50 bg-background/95 p-3 shadow-xl backdrop-blur-sm sm:p-4">
                        <p className="mb-2 text-[13px] font-medium text-muted-foreground">
                          {label}
                        </p>
                        <div className="flex items-center gap-2">
                          <div
                            className="size-2 rounded-full"
                            style={{ background: baseColr }}
                          />
                          <p className="text-sm font-bold tracking-tight text-foreground sm:text-base">
                            {formatFullCurrency(payload[0].value as number)}
                          </p>
                        </div>
                      </div>
                    );
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={baseColr}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  activeDot={{ r: 6, strokeWidth: 0, fill: baseColr }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-75 flex-col items-center justify-center space-y-3 rounded-xl border border-dashed border-border p-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <Activity
                className="size-6 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            <div>
              <p className="text-sm font-semibold">No chart data</p>
              <p className="mt-1 max-w-50 text-xs text-muted-foreground">
                Revenue trends will populate here once transactions begin.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
