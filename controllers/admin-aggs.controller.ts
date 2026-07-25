import { adminAuth } from "@/lib/admin-auth";
import { DateRange } from "@/lib/panel-types";
import {
  dashboardKpis,
  dahsboardAnalysis,
} from "@/services/admin-analysis.service";
import { getServicesStatus } from "@/services/analytics.service";
import { providerDashboard } from "@/services/providerBoard.service";
import { unstable_cache } from "next/cache";

const { getRevenueTimeSeries, getTopProducts, getBookingStatusBreakdown } =
  providerDashboard;

const TWO_MIN_TTL = 120;
const FIVE_MIN_TTL = 300;

const getCachedDashboardKpis = unstable_cache(
  dashboardKpis,
  ["admin-dashboard-kpis"],
  {
    revalidate: TWO_MIN_TTL,
    tags: ["providers"],
  },
);

const getCachedTimeSeries = unstable_cache(
  async (range: DateRange = "30d") => getRevenueTimeSeries(range),
  ["admin-timeseries"],
  {
    revalidate: TWO_MIN_TTL,
    tags: ["timeseries"],
  },
);

const getCachedTopProducts = unstable_cache(
  getTopProducts,
  ["admin-top-products"],
  {
    revalidate: FIVE_MIN_TTL,
    tags: ["products"],
  },
);

const getCachedServicesStatus = unstable_cache(
  getServicesStatus,
  ["admin-services-status"],
  {
    revalidate: FIVE_MIN_TTL,
    tags: ["products"],
  },
);

const getCachedDashboardAnalysis = unstable_cache(
  dahsboardAnalysis,
  ["admin-dashboard-analysis"],
  {
    revalidate: FIVE_MIN_TTL,
    tags: ["providers", "products"],
  },
);

const getCachedStatusBreakdown = unstable_cache(
  async () => getBookingStatusBreakdown(),
  ["admin-booking-status"],
  {
    revalidate: TWO_MIN_TTL,
    tags: ["status"],
  },
);

export async function dashboardData(range: DateRange = "30d") {
  try {
    const { admin, status } = await adminAuth();

    if (!admin || status !== "ok") {
      return {
        success: false,
        error: "Access denied.",
      };
    }

    const [
      kpis,
      revenueSeries,
      topProducts,
      servicesStatus,
      analysis,
      bookingStatus,
    ] = await Promise.all([
      getCachedDashboardKpis(),
      getCachedTimeSeries(range),
      getCachedTopProducts(),
      getCachedServicesStatus(),
      getCachedDashboardAnalysis(),
      getCachedStatusBreakdown(),
    ]);

    return {
      success: true,
      data: {
        kpis,
        revenueSeries,
        topProducts,
        servicesStatus,
        analysis,
        bookingStatus,
      },
    };
  } catch (error) {
    console.error("Dashboard controller error:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to load dashboard data.",
    };
  }
}
