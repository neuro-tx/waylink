"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PieChart as PieChartIcon } from "lucide-react";

type StatusItem = {
  status: string;
  percentage: number;
};

const STATUS_COLORS: Record<string, string> = {
  confirmed: "#3b82f6",
  completed: "#10b981",
  pending: "#f59e0b",
  cancelled: "#ef4444",
  expired: "#737373",
};

export function StatusPieChart({ data }: { data: StatusItem[] }) {
  const formattedData = data.map((item) => ({
    name: item.status.toLowerCase(),
    value: item.percentage,
    color: STATUS_COLORS[item.status.toLowerCase()] || "#6b7280",
  }));

  return (
    <Card className="flex flex-col border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle>Booking Status</CardTitle>
        <CardDescription>
          Breakdown of your bookings this period.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-6">
        {data.length > 0 ? (
          <div className="flex w-full flex-col items-center gap-6 md:flex-row lg:flex-col xl:flex-row">
            <div className="relative h-55 w-full shrink-0 md:w-1/2 lg:w-full xl:w-55">
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-sm font-medium text-muted-foreground">
                  Total
                </span>
                <span className="text-lg font-bold tracking-tight text-foreground">
                  100%
                </span>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={formattedData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={4}
                    stroke="none"
                    cornerRadius={4}
                  >
                    {formattedData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>

                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const item = payload[0].payload;

                      return (
                        <div className="rounded-xl border border-border/50 bg-background/95 p-3 shadow-xl backdrop-blur-sm sm:p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="size-2.5 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <p className="text-[13px] font-medium capitalize text-muted-foreground">
                              {item.name}
                            </p>
                          </div>
                          <p className="text-sm font-bold tracking-tight text-foreground sm:text-base">
                            {item.value}%
                          </p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex w-full flex-col justify-center space-y-1 md:w-1/2 lg:w-full xl:flex-1">
              {formattedData.map((item) => (
                <div
                  key={item.name}
                  className="group flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted/40"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="size-3 rounded-full shadow-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium capitalize text-foreground transition-colors group-hover:text-foreground/80">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-sm font-semibold tracking-tight text-muted-foreground">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex h-62.5 flex-col items-center justify-center space-y-3 rounded-xl border border-dashed border-border p-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <PieChartIcon
                className="size-6 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            <div>
              <p className="text-sm font-semibold">No status data</p>
              <p className="mt-1 max-w-50 text-xs text-muted-foreground">
                Your booking statuses will be charted here.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
