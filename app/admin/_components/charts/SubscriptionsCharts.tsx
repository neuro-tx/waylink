"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import type { SubscriptionsAnalytics } from "@/lib/admin-types";

const PLAN_COLORS = ["#378ADD", "#1D9E75", "#EF9F27", "#D85A30", "#7F77DD"];
const CONV_COLORS = ["#1D9E75", "#e4e4e7"];

function formatCurrency(value: number) {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${value}`;
}

export function SubscriptionsCharts({
  analytics,
}: {
  analytics: SubscriptionsAnalytics;
}) {
  const conversionData = [
    { name: "Converted", value: analytics.trialConversionRate },
    { name: "Not converted", value: 100 - analytics.trialConversionRate },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr_1fr]">
      <div className="rounded-xl border border-border/50 bg-card p-4">
        <p className="text-sm font-medium text-foreground">MRR trend</p>
        <p className="text-xs text-muted-foreground mt-0.5 mb-4">
          Monthly recurring revenue over 6 months
        </p>
        {analytics.mrrTrend.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart
              data={analytics.mrrTrend}
              margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id="mrr-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#378ADD" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#378ADD" stopOpacity={0} />
                </linearGradient>
                <linearGradient
                  id="new-mrr-gradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#1D9E75" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#1D9E75" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                strokeOpacity={0.5}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={formatCurrency}
                width={44}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--popover))",
                  border: "0.5px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: 12,
                }}
                // formatter={(value: number, name: string) => [
                //   formatCurrency(value),
                //   name === "mrr" ? "MRR" : "New MRR",
                // ]}
              />
              <Area
                type="monotone"
                dataKey="mrr"
                stroke="#378ADD"
                strokeWidth={2}
                fill="url(#mrr-gradient)"
                dot={{ r: 3, fill: "#378ADD", strokeWidth: 0 }}
              />
              <Area
                type="monotone"
                dataKey="newMrr"
                stroke="#1D9E75"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fill="url(#new-mrr-gradient)"
                dot={{ r: 3, fill: "#1D9E75", strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-44 items-center justify-center text-sm text-muted-foreground">
            No MRR data yet
          </div>
        )}
      </div>

      {/* Plan Distribution */}
      <div className="rounded-xl border border-border/50 bg-card p-4">
        <p className="text-sm font-medium text-foreground">Plan distribution</p>
        <p className="text-xs text-muted-foreground mt-0.5 mb-2">
          Active subs by plan tier
        </p>
        {analytics.planDistribution.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={130}>
              <PieChart>
                <Pie
                  data={analytics.planDistribution}
                  dataKey="count"
                  nameKey="planName"
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={58}
                  strokeWidth={0}
                >
                  {analytics.planDistribution.map((_, i) => (
                    <Cell key={i} fill={PLAN_COLORS[i % PLAN_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "0.5px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: 12,
                  }}
                  //   formatter={(value: number, name: string) => [value, name]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-1 mt-1">
              {analytics.planDistribution.map((p, i) => {
                const total = analytics.planDistribution.reduce(
                  (s, r) => s + r.count,
                  0,
                );
                const pct = total > 0 ? Math.round((p.count / total) * 100) : 0;
                return (
                  <div
                    key={p.planName}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground"
                  >
                    <span
                      className="inline-block h-2 w-2 rounded-sm shrink-0"
                      style={{
                        background: PLAN_COLORS[i % PLAN_COLORS.length],
                      }}
                    />
                    {p.planName} <span className="ml-auto">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex h-44 items-center justify-center text-sm text-muted-foreground">
            No data yet
          </div>
        )}
      </div>

      {/* Trial Conversion */}
      <div className="rounded-xl border border-border/50 bg-card p-4">
        <p className="text-sm font-medium text-foreground">Trial conversion</p>
        <p className="text-xs text-muted-foreground mt-0.5 mb-2">
          Trials converted this month
        </p>
        <ResponsiveContainer width="100%" height={130}>
          <PieChart>
            <Pie
              data={conversionData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={38}
              outerRadius={58}
              strokeWidth={0}
              startAngle={90}
              endAngle={-270}
            >
              {conversionData.map((_, i) => (
                <Cell key={i} fill={CONV_COLORS[i]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "hsl(var(--popover))",
                border: "0.5px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: 12,
              }}
              //   formatter={(value: number, name: string) => [`${value}%`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-col gap-1 mt-1">
          {conversionData.map((d, i) => (
            <div
              key={d.name}
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <span
                className="inline-block h-2 w-2 rounded-sm shrink-0"
                style={{ background: CONV_COLORS[i] }}
              />
              {d.name} <span className="ml-auto">{d.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
