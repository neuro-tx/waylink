import {
  BookingStatusBreakdown,
  DateRange,
  ProviderKPIs,
} from "@/lib/panel-types";
import { getCurrentProvider } from "@/lib/provider-auth";
import {
  getPayoutSummary,
  getPeakBookingHours,
  getRevenueOverTime,
} from "@/services/analytics.service";
import { providerDashboard } from "@/services/providerBoard.service";
import {
  PayoutSummary,
  PeakBookingHours,
  RevenueOverTime,
} from "@/lib/panel-types";
import { ProviderStats } from "@/lib/all-types";

const { getBookingStatusBreakdown, getProviderKPIs, getProviderStats } =
  providerDashboard;

type typoe = {
  success: boolean;
  data: {
    payout: PayoutSummary;
    peakBooking: PeakBookingHours;
    revenues: RevenueOverTime;
    bookingBreakdown: BookingStatusBreakdown[];
    kpis: ProviderKPIs;
    stats: ProviderStats;
  };
};

export async function analyticsController(period: DateRange = "30d") {
  try {
    const { provider } = await getCurrentProvider();
    if (!provider) throw new Error("Unauthorized.");

    const [payout, peakBooking, revenues, bookingBreakdown, kpis, stats] =
      await Promise.all([
        getPayoutSummary(provider.id, period),
        getPeakBookingHours(provider.id, period),
        getRevenueOverTime(provider.id, period),
        getBookingStatusBreakdown(provider.id),
        getProviderKPIs(provider.id, period),
        getProviderStats(provider.id),
      ]);

    return {
      success: true,
      data: {
        payout,
        peakBooking,
        revenues,
        bookingBreakdown,
        kpis,
        stats,
      },
    };
  } catch (error) {
    console.error("Analytics Controller Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to load analytics data.";

    return {
      success: false,
      error: errorMessage,
    };
  }
}

// export interface PayoutSummary {
//   grossEarnings: number;
//   platformFeeAmount: number;
//   platformFeeRate: number;
//   netPayout: number;
//   pendingPayoutAmount: number;
//   nextPayoutDate: Date;
//   periodComparison: {
//     current: number;
//     previous: number;
//     changePercent: number;
//   };
// }

// export interface HeatmapCell {
//   dayOfWeek: number;
//   hour: number;
//   count: number;
//   hourLabel: string;
//   intensity: 0 | 1 | 2 | 3 | 4;
// }

// export interface PeakBookingHours {
//   cells: HeatmapCell[];
//   peakDay: string;
//   peakHour: string;
//   totalBookingsInPeriod: number;
// }

// export interface RevenueDataPoint {
//   date: Date | string;
//   revenue: number;
//   bookings: number;
// }

// export interface RevenueOverTime {
//   current: RevenueDataPoint[];
//   previous: RevenueDataPoint[];
//   totalRevenue: number;
//   totalBookings: number;
//   peakDay: RevenueDataPoint;
//   avgDailyRevenue: number;
// }
// export interface BookingStatusBreakdown {
//   status: BookingStatus;
//   count: number;
//   percentage: number;
// }
// export type GrowthMetric = {
//   value: number | null;
//   direction: "up" | "down" | "flat" | "n/a";
//   formatted: string;
// };

// export interface ProviderKPIs {
//   repeatCustomerRate: number;
//   avgRevenuePerBooking: number;
//   revenueGrowth: GrowthMetric;
//   bookingGrowth: GrowthMetric;
//   cancellationRate: number;
// }
// export type ProviderStats = {
//   totalServices: number;
//   avgRating: string;
//   totalReviews: number;
//   fiveStar: number;
//   fourStar: number;
//   threeStar: number;
//   twoStar: number;
//   oneStar: number;
// };