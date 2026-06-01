import { Metadata } from "next";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { analyticsController } from "@/controllers/analytics.controller";
import { DateRange } from "@/lib/panel-types";
import { AnalyticsHeader } from "../_components/Analyticsheader";
import { AnalyticsRevenue } from "../_components/AnalyticsRevenue";
import { PayoutSummaryCard } from "../_components/Payoutsummarycard";
import { StatusPieChart } from "../_components/charts/StatusPieChart";
import { AnalyticsKpiCards } from "../_components/AnalyticsKpiCards";
import { ProviderStatsOverview } from "../_components/ProviderStatsOverview";
import { PeakBookings } from "../_components/Peakbookings";

export const metadata: Metadata = {
  title: "Analytics",
  description:
    "Track revenue, bookings, payouts, ratings, and provider performance metrics.",
};

interface PageProps {
  searchParams: Promise<{
    period?: string;
  }>;
}

function AnalyticsError({ message }: { message: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="size-4" />
        <AlertTitle>Failed to load analytics</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    </div>
  );
}

export default async function AnalyticsPage({ searchParams }: PageProps) {
  const { period: rawPeriod } = await searchParams;
  const validPeriods: DateRange[] = ["7d", "30d", "90d", "1y"];

  const period: DateRange = validPeriods.includes(rawPeriod as DateRange)
    ? (rawPeriod as DateRange)
    : "30d";

  const result = await analyticsController(period);

  if (!result.success || !result.data) {
    return (
      <AnalyticsError
        message={
          "error" in result
            ? (result.error ?? "Unknown error occurred.")
            : "Unknown error occurred."
        }
      />
    );
  }

  const {
    payout,
    revenues,
    bookingBreakdown,
    kpis,
    stats,
    peakBooking,
    statusBars,
  } = result.data;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-5">
          <AnalyticsHeader current={period} />

          <AnalyticsKpiCards kpis={kpis} revenues={revenues} />

          {stats && <ProviderStatsOverview stats={stats} />}

          <AnalyticsRevenue revenues={revenues} />

          <div className="grid gap-4 lg:grid-cols-2">
            <StatusPieChart data={bookingBreakdown} />

            <PayoutSummaryCard payout={payout} />
          </div>

          <PeakBookings data={peakBooking} statusBars={statusBars} />
        </div>
      </div>
    </main>
  );
}
