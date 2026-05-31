"use client";

import { motion } from "motion/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RevenueOverTime } from "@/lib/panel-types";
import { RevenueChart } from "./charts/RevenueChart";
import { fmtDate } from "@/lib/utils";
import { fmtCurrency } from "@/lib/helpers";

interface Props {
  revenues: RevenueOverTime;
}

export function AnalyticsRevenue({ revenues }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-semibold">
                Revenue Analytics
              </CardTitle>
              <CardDescription>
                Revenue performance and booking trends across the selected
                period.
              </CardDescription>
            </div>

            <Badge variant="secondary">
              {revenues.totalBookings.toLocaleString()} bookings
            </Badge>
          </div>

          {/* Inline summary */}
          <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Daily Average
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums">
                {fmtCurrency(revenues.avgDailyRevenue)}
              </p>
            </div>

            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Peak Day
              </p>
              <p className=" text-2xl font-bold tabular-nums">
                {fmtCurrency(revenues.peakDay.revenue)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {fmtDate(revenues.peakDay.date)}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="grid gap-4 xl:grid-cols-2">
          <RevenueChart
            data={revenues.current}
            title="Current Period Revenue"
            description="Revenue and booking activity for the selected period."
            block={false}
          />
          <RevenueChart
            data={revenues.previous}
            title="Previous Period Revenue"
            description="Revenue and booking activity from the previous equivalent period."
            block={false}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
