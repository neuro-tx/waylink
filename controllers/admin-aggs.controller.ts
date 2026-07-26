import { adminAuth } from "@/lib/admin-auth";
import { DateRange } from "@/lib/panel-types";
import {
  dashboardKpis,
  dahsboardAnalysis,
} from "@/services/admin-analysis.service";
import { getServicesStatus } from "@/services/analytics.service";
import { providerDashboard } from "@/services/providerBoard.service";

const { getRevenueTimeSeries, getTopProducts, getBookingStatusBreakdown } =
  providerDashboard;

export async function dashboardData(range: DateRange = "90d") {
  const { admin, status } = await adminAuth();
  if (!admin || status !== "ok") throw new Error("Access denied.");

  const [
    kpis,
    revenueSeries,
    topProducts,
    servicesStatus,
    analysis,
    bookingStatus,
  ] = await Promise.all([
    dashboardKpis(),
    getRevenueTimeSeries(range),
    getTopProducts(),
    getServicesStatus(),
    dahsboardAnalysis(),
    getBookingStatusBreakdown(),
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
