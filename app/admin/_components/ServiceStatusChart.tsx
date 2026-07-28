"use client";

import { Label, Pie, PieChart } from "recharts";
import { Activity, Archive, FileEdit, PauseCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { StatusItem } from "@/lib/panel-types";
import { useMemo } from "react";

const chartConfig = {
  active: {
    label: "Active",
    color: "#22C55E",
    icon: Activity,
  },
  paused: {
    label: "Paused",
    color: "#F97316",
    icon: PauseCircle,
  },
  draft: {
    label: "Draft",
    color: "#8B5CF6",
    icon: FileEdit,
  },
  archived: {
    label: "Archived",
    color: "#64748B",
    icon: Archive,
  },
} satisfies ChartConfig;

export function ServiceStatusChart({ data }: { data: StatusItem[] }) {
  const totalServices = useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.count, 0);
  }, [data]);

  const isEmpty = data.length === 0 || totalServices === 0;

  const chartData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      count: Number(item.count),
      fill: chartConfig[item.status].color ?? "#6B7280",
    }));
  }, [data]);

  return (
    <Card className="flex flex-col bg-background w-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>Service Status Overview</CardTitle>
        <CardDescription>Current distribution of all services</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {isEmpty ? (
          <div className="flex h-70 flex-col items-center justify-center rounded-md bg-linear-to-br from-muted/30 via-transparent to-muted/10 px-6">
            <div className="relative mb-6 flex items-center justify-center">
              <div className="absolute -left-12 rounded-full border border-emerald-500/15 bg-emerald-500/5 p-2">
                <Activity className="size-5 text-emerald-500/40" />
              </div>
              <div className="absolute -right-12 rounded-full border border-amber-500/15 bg-amber-500/5 p-2">
                <PauseCircle className="size-5 text-amber-500/40" />
              </div>
              <div className="absolute -top-4 left-2 rounded-full border border-blue-500/15 bg-blue-500/5 p-2">
                <FileEdit className="size-4 text-blue-500/40" />
              </div>
              <div className="absolute -bottom-4 -left-4 rounded-full border border-slate-500/15 bg-slate-500/5 p-2">
                <Archive className="size-4 text-slate-500/40" />
              </div>
              <div className="relative flex size-12 items-center justify-center rounded-full bg-transparent">
                <Activity className="size-6 text-emerald-500" />
              </div>
            </div>

            <h3 className="mt-3 text-base font-semibold">
              No services available
            </h3>

            <p className="mt-2 max-w-xs text-center text-sm text-muted-foreground">
              Service status insights will appear once providers publish
              services on the platform.
            </p>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs text-muted-foreground">Active</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-amber-500" />
                <span className="text-xs text-muted-foreground">Paused</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-blue-500" />
                <span className="text-xs text-muted-foreground">Draft</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-slate-500" />
                <span className="text-xs text-muted-foreground">Archived</span>
              </div>
            </div>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-60"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="status"
                innerRadius={70}
                strokeWidth={5}
                paddingAngle={3}
                cornerRadius={3}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {totalServices.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground text-sm"
                          >
                            Total Services
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>

      {!isEmpty && (
        <CardFooter className="flex-col gap-4 text-sm pt-6">
          <div className="w-full space-y-2">
            {data.map((item) => {
              const config = chartConfig[item.status];
              const Icon = config.icon;

              return (
                <div
                  key={item.status}
                  className="flex items-center w-full gap-3"
                >
                  <div className="flex items-center gap-2 w-28 shrink-0 text-muted-foreground">
                    <Icon className="h-4 w-4" style={{ color: config.color }} />
                    <span className="capitalize">{item.status}</span>
                  </div>

                  <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: config.color,
                      }}
                    />
                  </div>

                  <div className="flex w-24 shrink-0 items-center justify-end gap-2 text-right">
                    <span className="font-medium text-foreground">
                      {item.count}
                    </span>
                    <span className="text-muted-foreground text-xs w-9">
                      ({item.percentage}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
