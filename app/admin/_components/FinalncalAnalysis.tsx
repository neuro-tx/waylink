"use client";

import { useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { fmtCurrency } from "@/lib/helpers";
import CountUpMotion from "@/components/CountUpMotion";

export type FeeSlice = { label: string; value: number; fill: string };

const labelMap: Record<string, string> = {
  booking_commission: "Booking Commission",
  subscription: "Subscriptions",
  payout_fee: "Payout Fees",
  late_fee: "Late Fees",
  other: "Other",
};
const colorMap: Record<string, string> = {
  booking_commission: "#0ea5e9",
  subscription: "#8b5cf6",
  payout_fee: "#10b981",
  late_fee: "#f59e0b",
  other: "#64748b",
};

function FinalncalDonut({
  slices,
  total,
}: {
  slices: FeeSlice[];
  total: number;
}) {
  if (slices.length === 0 || total === 0) {
    return (
      <CardContent>
        <p className="py-10 text-center text-sm text-muted-foreground">
          No fee activity yet.
        </p>
      </CardContent>
    );
  }

  return (
    <CardContent className="flex flex-col items-center">
      <div className="relative flex h-60 w-full items-center justify-center">
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
                  <div className="rounded-lg border border-border bg-background/50 px-3 py-4 shadow-xl backdrop-blur-md">
                    <div className="flex items-start gap-3">
                      <div
                        className="size-3 mt-1 rounded-full shadow-sm"
                        style={{ background: data.fill }}
                      />
                      <div className="flex flex-col pr-2">
                        <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                          {labelMap[data.label] ?? data.label}
                        </span>
                        <span className="text-base font-bold text-foreground">
                          {fmtCurrency(data.value)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
            <Pie
              data={slices}
              dataKey="value"
              nameKey="label"
              innerRadius={75}
              outerRadius={105}
              paddingAngle={2}
              stroke="hsl(var(--background))"
              strokeWidth={3}
            >
              {slices.map((s) => (
                <Cell key={s.label} fill={s.fill} className="outline-none" />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute z-0 inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-semibold tracking-tight text-foreground">
            <CountUpMotion value={total} />
          </div>
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Total Fees
          </span>
        </div>
      </div>

      <div className="pt-5 border-t w-full">
        <ul className="flex flex-col gap-0.5">
          {slices.map((s) => (
            <li
              key={s.label}
              className="group flex items-center justify-between text-sm transition-colors hover:bg-muted/40 rounded-sm -mx-2 p-2"
            >
              <div className="flex items-center gap-2.5 text-muted-foreground group-hover:text-foreground transition-colors">
                <span
                  className="h-2.5 w-2.5 rounded-full shadow-sm"
                  style={{ backgroundColor: s.fill }}
                />
                <span className="font-medium">
                  {labelMap[s.label] ?? s.label}
                </span>
              </div>
              <span className="font-semibold text-foreground">
                {fmtCurrency(s.value)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </CardContent>
  );
}

export function FinalncalAnalysis() {
  const slices: { label: string; value: number }[] = useMemo(
    () => [
      {
        label: "booking_commission",
        value: 125400,
      },
      {
        label: "subscription",
        value: 45000,
      },
      {
        label: "payout_fee",
        value: 12450,
      },
      {
        label: "late_fee",
        value: 5200,
      },
      {
        label: "other",
        value: 2350,
      },
    ],
    [],
  );

  const formattedData = slices.map((item) => ({
    ...item,
    fill: colorMap[item.label] || colorMap.other,
  }));

  const total = useMemo(() => {
    return slices.reduce((sum, s) => sum + s.value, 0);
  }, [slices]);

  return (
    <Card className="border-none shadow-sm h-full">
      <CardHeader>
        <CardTitle className="text-base">Platform Fees Breakdown</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Distribution of revenue sources over the last 30 days
        </CardDescription>
      </CardHeader>

      <FinalncalDonut slices={formattedData} total={total} />
    </Card>
  );
}
