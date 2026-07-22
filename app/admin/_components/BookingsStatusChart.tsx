"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

type StatusItem = {
  status: string;
  percentage: number;
};

const STATUS_COLORS: Record<string, string> = {
  confirmed: "#3B82F6",
  completed: "#10B981",
  pending: "#F59E0B",
  cancelled: "#EF4444",
  expired: "#64748B",
};

export function BookingsStatusChart({ data }: { data: StatusItem[] }) {
  const { total, chartData } = useMemo(() => {
    const chartData = data.map((item) => ({
      name: item.status,
      value: item.percentage,
      color: STATUS_COLORS[item.status.toLowerCase()] ?? "#6B7280",
    }));

    return {
      total: chartData.reduce((sum, item) => sum + item.value, 0),
      chartData,
    };
  }, [data]);

  return (
    <Card className="flex h-full flex-col border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold tracking-tight">
          Booking Status
        </CardTitle>
        <CardDescription>All-time distribution of bookings</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 px-6">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No booking data available for now.
          </div>
        ) : (
          <div className="space-y-5">
            <div className="relative flex h-56 items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    cornerRadius={3}
                    stroke="none"
                  >
                    {chartData.map((item) => (
                      <Cell
                        key={item.name}
                        fill={item.color}
                        className="outline-none transition-opacity hover:opacity-80"
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="pointer-events-none absolute z-0 inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{total.toFixed(0)}%</span>
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  Total
                </span>
              </div>
            </div>

            <ul className="space-y-0.5 -mx-2">
              {chartData.map((item) => (
                <li
                  key={item.name}
                  className="flex items-center justify-between rounded-md p-2 transition-colors hover:bg-muted/40"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="size-3 rounded-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium capitalize text-muted-foreground">
                      {item.name}
                    </span>
                  </div>

                  <span className="text-sm font-semibold">{item.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
