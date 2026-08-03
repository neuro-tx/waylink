import { unstable_cache } from "next/cache";
import { adminAuth } from "@/lib/admin-auth";
import { DateRange } from "@/lib/panel-types";
import {
  dashboardKpis,
  dahsboardAnalysis,
  getInsights,
} from "@/services/admin-analysis.service";
import { getServicesStatus } from "@/services/analytics.service";
import { providerDashboard } from "@/services/providerBoard.service";

const { getRevenueTimeSeries, getTopProducts, getBookingStatusBreakdown } =
  providerDashboard;

const DASHBOARD_TTL = 300;
const ANALYTICS_TTL = 120;

const getCachedDashboardKpis = unstable_cache(
  dashboardKpis,
  ["admin-dashboard-kpis"],
  {
    revalidate: DASHBOARD_TTL,
    tags: ["all"],
  },
);

const getCachedTopProducts = unstable_cache(
  getTopProducts,
  ["admin-top-products"],
  {
    revalidate: ANALYTICS_TTL,
    tags: ["products"],
  },
);

const getCachedDashboardAnalysis = unstable_cache(
  dahsboardAnalysis,
  ["admin-dashboard-analysis"],
  {
    revalidate: ANALYTICS_TTL,
    tags: ["all"],
  },
);

const getCachedServiceStatus = unstable_cache(
  getServicesStatus,
  ["admin-service-status"],
  {
    revalidate: ANALYTICS_TTL,
    tags: ["products"],
  },
);

const getCachedBookingStatus = unstable_cache(
  getBookingStatusBreakdown,
  ["admin-booking-status"],
  {
    revalidate: DASHBOARD_TTL,
    tags: ["bookings"],
  },
);

const getCachedRevenueSeries = unstable_cache(
  async (range: DateRange) => getRevenueTimeSeries(range),
  ["admin-revenue-series"],
  {
    revalidate: DASHBOARD_TTL,
    tags: ["bookings", "plans"],
  },
);

export async function dashboardData(range: DateRange = "90d") {
  const { admin, status } = await adminAuth();

  if (!admin || status !== "ok") {
    throw new Error("Access denied.");
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
    getCachedRevenueSeries(range),
    getCachedTopProducts(),
    getCachedServiceStatus(),
    getCachedDashboardAnalysis(),
    getCachedBookingStatus(),
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
}

export async function getDashboardInsights(range?: DateRange) {
  const { admin, status } = await adminAuth();

  if (!admin || status !== "ok") {
    throw new Error("Access denied.");
  }

  return await getInsights(range);
}
