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
import { TicketPercent } from "lucide-react";

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
    <Card className="flex bg-background h-full flex-col shadow-sm">
      <CardHeader>
        <CardTitle>Booking Status</CardTitle>
        <CardDescription>All-time distribution of bookings</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 px-6">
        {chartData.length === 0 ? (
          <div className="flex h-80 flex-col items-center justify-center rounded-md bg-linear-to-br from-muted/30 via-transparent to-muted/10">
            <div className="relative mb-6 flex items-center justify-center">
              <div className="absolute -left-12 bottom-0 flex items-end gap-1">
                <div className="h-7 w-2 rounded-full bg-emerald-500/20" />
                <div className="h-11 w-2 rounded-full bg-emerald-500/35" />
                <div className="h-16 w-2 rounded-full bg-emerald-500/50" />
              </div>

              <div className="absolute -right-12 bottom-0 flex items-end gap-1">
                <div className="h-9 w-2 rounded-full bg-amber-500/30" />
                <div className="h-14 w-2 rounded-full bg-blue-500/40" />
                <div className="h-20 w-2 rounded-full bg-blue-500/55" />
              </div>

              <svg
                className="absolute -top-6 h-28 w-40"
                viewBox="0 0 160 110"
                fill="none"
              >
                <path
                  d="M8 88 C40 72 62 78 82 50 S125 38 152 18"
                  stroke="rgb(59 130 246 / .18)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                <circle cx="8" cy="88" r="3" fill="rgb(16 185 129 / .25)" />
                <circle cx="82" cy="50" r="3" fill="rgb(245 158 11 / .35)" />
                <circle cx="152" cy="18" r="3" fill="rgb(59 130 246 / .45)" />
              </svg>

              <div className="relative flex size-12 items-center justify-center rounded-full bg-transparent">
                <TicketPercent className="size-6 text-blue-500" />
              </div>
            </div>

            <h3 className="mt-3 text-base font-semibold">
              No bookings available
            </h3>

            <p className="mt-2 max-w-xs text-center text-sm text-muted-foreground">
              Booking status insights will appear once customers begin creating
              bookings on the platform.
            </p>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-blue-500" />
                <span className="text-xs text-muted-foreground">Confirmed</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs text-muted-foreground">Completed</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-amber-500" />
                <span className="text-xs text-muted-foreground">Pending</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-red-500" />
                <span className="text-xs text-muted-foreground">Cancelled</span>
              </div>
            </div>
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
