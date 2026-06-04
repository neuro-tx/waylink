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
  getServicesStatus,
} from "@/services/analytics.service";
import { providerDashboard } from "@/services/providerBoard.service";
import {
  PayoutSummary,
  PeakBookingHours,
  RevenueOverTime,
} from "@/lib/panel-types";
import { ProviderStats } from "@/lib/all-types";
import { productSerices } from "@/services/product.service";

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

    const [
      payout,
      peakBooking,
      revenues,
      bookingBreakdown,
      kpis,
      stats,
      statusBars,
    ] = await Promise.all([
      getPayoutSummary(provider.id, period),
      getPeakBookingHours(provider.id, period),
      getRevenueOverTime(provider.id, period),
      getBookingStatusBreakdown(provider.id),
      getProviderKPIs(provider.id, period),
      getProviderStats(provider.id),
      getServicesStatus(provider.id),
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
        statusBars,
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

export async function getServiceAnalytics(serviceId: string) {
  if (!serviceId) throw new Error("Service ID is required.");
  const { provider } = await getCurrentProvider();
  if (!provider)
    throw new Error("You must be signed in to view service analytics.");

  return await productSerices.getServiceAnalytics(provider.id, serviceId);
}
