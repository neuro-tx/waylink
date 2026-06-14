"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { SubscriptionsAnalytics } from "@/lib/admin-types";
import { fmtCurrency } from "@/lib/helpers";

const PLAN_COLORS = ["#378ADD", "#1D9E75", "#EF9F27", "#D85A30", "#7F77DD"];

const CONV_COLORS = {
  converted: "#a510f2",
  notConverted: "#D97706",
};

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/50 p-4">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground mt-0.5 mb-4">{subtitle}</p>
      {children}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-44 items-center justify-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

const mrrChartConfig = {
  mrr: {
    label: "MRR",
    color: "#378ADD",
  },
  newMrr: {
    label: "New MRR",
    color: "#1D9E75",
  },
} satisfies ChartConfig;

const conversionChartConfig = {
  Converted: {
    label: "Converted",
    color: CONV_COLORS.converted,
  },
  "Not converted": {
    label: "Not converted",
    color: CONV_COLORS.notConverted,
  },
} satisfies ChartConfig;

function MrrTrendChart({ data }: { data: SubscriptionsAnalytics["mrrTrend"] }) {
  if (data.length === 0) return <EmptyState message="No MRR data yet" />;

  return (
    <ChartContainer config={mrrChartConfig} className="h-50 w-full">
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="grad-mrr" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#378ADD" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#378ADD" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="grad-newmrr" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1D9E75" stopOpacity={0.12} />
            <stop offset="95%" stopColor="#1D9E75" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="3 3"
          strokeOpacity={0.5}
          vertical={false}
        />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickMargin={8}
        />
        <YAxis
          tick={{ fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={44}
        />

        <ChartTooltip
          content={
            <ChartTooltipContent
              labelKey="month"
              formatter={(value, name) => (
                <div className="flex items-center justify-between gap-6 min-w-32.5">
                  <span className="text-muted-foreground text-xs">
                    {name === "mrr" ? "MRR" : "New MRR"}
                  </span>
                  <span className="font-medium tabular-nums">
                    {fmtCurrency(Number(value))}
                  </span>
                </div>
              )}
            />
          }
        />

        <ChartLegend content={<ChartLegendContent />} />

        <Area
          type="monotone"
          dataKey="mrr"
          stroke="#378ADD"
          strokeWidth={2}
          fill="url(#grad-mrr)"
          dot={{ r: 3, fill: "#378ADD", strokeWidth: 0 }}
          activeDot={{ r: 5, strokeWidth: 0 }}
        />
        <Area
          type="monotone"
          dataKey="newMrr"
          stroke="#1D9E75"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          fill="url(#grad-newmrr)"
          dot={{ r: 3, fill: "#1D9E75", strokeWidth: 0 }}
          activeDot={{ r: 5, strokeWidth: 0 }}
        />
      </AreaChart>
    </ChartContainer>
  );
}

function PlanDistributionChart({
  data,
}: {
  data: SubscriptionsAnalytics["planDistribution"];
}) {
  if (data.length === 0)
    return <EmptyState message="No active subscriptions" />;

  const total = data.reduce((s, r) => s + r.count, 0);

  const chartConfig = Object.fromEntries(
    data.map((p, i) => [
      p.planName,
      { label: p.planName, color: PLAN_COLORS[i % PLAN_COLORS.length] },
    ]),
  ) satisfies ChartConfig;

  return (
    <>
      <ChartContainer config={chartConfig} className="h-35 w-full">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="planName"
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={60}
            paddingAngle={2}
            strokeWidth={0}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={PLAN_COLORS[i % PLAN_COLORS.length]} />
            ))}
          </Pie>

          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name) => (
                  <div className="flex items-center justify-between gap-6 min-w-35">
                    <span className="text-muted-foreground text-xs">
                      {name}
                    </span>
                    <div className="flex items-center gap-2 font-medium tabular-nums">
                      <span>{value as number} subs</span>
                      <span className="text-muted-foreground">
                        (
                        {total > 0
                          ? Math.round(((value as number) / total) * 100)
                          : 0}
                        %)
                      </span>
                    </div>
                  </div>
                )}
              />
            }
          />
        </PieChart>
      </ChartContainer>

      <div className="flex flex-col gap-1.5 mt-2">
        {data.map((p, i) => {
          const pct = total > 0 ? Math.round((p.count / total) * 100) : 0;
          return (
            <div
              key={p.planName}
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <span
                className="inline-block h-2 w-2 rounded-sm shrink-0"
                style={{ background: PLAN_COLORS[i % PLAN_COLORS.length] }}
              />
              <span>{p.planName}</span>
              <span className="ml-auto tabular-nums">
                {p.count} · {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}

function TrialConversionChart({ rate }: { rate: number }) {
  const conversionData = [
    { name: "Converted", value: rate },
    { name: "Not converted", value: 100 - rate },
  ];

  return (
    <>
      <ChartContainer config={conversionChartConfig} className="h-35 w-full">
        <PieChart>
          <Pie
            data={conversionData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={42}
            outerRadius={62}
            strokeWidth={0}
            paddingAngle={0}
            startAngle={90}
            endAngle={-270}
          >
            <Cell fill={CONV_COLORS.converted} />
            <Cell fill={CONV_COLORS.notConverted} />
          </Pie>

          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name) => (
                  <div className="flex items-center justify-between gap-6 min-w-35">
                    <span className="text-muted-foreground text-xs">
                      {name}
                    </span>
                    <span className="font-medium tabular-nums">
                      {`${value}%`}
                    </span>
                  </div>
                )}
              />
            }
          />
        </PieChart>
      </ChartContainer>

      <div className="flex flex-col gap-1.5 mt-2">
        {conversionData.map((d, i) => (
          <div
            key={d.name}
            className="flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <span
              className="inline-block h-2 w-2 rounded-sm shrink-0"
              style={{
                background:
                  i === 0 ? CONV_COLORS.converted : CONV_COLORS.notConverted,
              }}
            />
            <span>{d.name}</span>
            <span className="ml-auto tabular-nums font-medium text-foreground">
              {`${d.value}%`}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

export function SubscriptionsCharts({
  analytics,
}: {
  analytics: SubscriptionsAnalytics;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr]">
      <ChartCard
        title="MRR trend"
        subtitle="Monthly recurring revenue over 6 months"
      >
        <MrrTrendChart data={analytics.mrrTrend} />
      </ChartCard>

      <ChartCard
        title="Plan distribution"
        subtitle="Active subscriptions by plan"
      >
        <PlanDistributionChart data={analytics.planDistribution} />
      </ChartCard>

      <ChartCard
        title="Trial conversion"
        subtitle="Trials that converted this month"
      >
        <TrialConversionChart rate={analytics.trialConversionRate} />
      </ChartCard>
    </div>
  );
}
