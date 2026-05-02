import { DateRange } from "@/lib/panel-types";
import { getCurrentProvider } from "@/lib/provider-auth";
import { providerDashboard } from "@/services/providerBoard.service";
import { unstable_cache } from "next/cache";
const {
  getBookingStatusBreakdown,
  getProviderKPIs,
  getProviderStats,
  getRecentBookings,
  getRevenueTimeSeries,
  getTopProducts,
} = providerDashboard;

const STATS_TTL = 60;
const CHARTS_TTL = 120;
const PRODUCTS_TTL = 300;
const BOOKINGS_TTL = 30;

const getCachedStats = unstable_cache(
  async (providerId: string) => getProviderStats(providerId),
  ["provider-stats"],
  { revalidate: STATS_TTL, tags: ["provider-stats"] },
);

const getCachedRecentBookings = unstable_cache(
  async (providerId: string) => getRecentBookings(providerId, 10),
  ["provider-bookings"],
  { revalidate: BOOKINGS_TTL, tags: ["bookings"] },
);

const getCachedTopProducts = unstable_cache(
  async (providerId: string) => getTopProducts(providerId),
  ["provider-products"],
  { revalidate: PRODUCTS_TTL, tags: ["products"] },
);

const getCachedTimeSeries = unstable_cache(
  async (providerId: string, range: DateRange) =>
    getRevenueTimeSeries(providerId, range),
  ["provider-timeseries"],
  { revalidate: CHARTS_TTL, tags: ["timeseries"] },
);

const getCachedStatusBreakdown = unstable_cache(
  async (providerId: string) => getBookingStatusBreakdown(providerId),
  ["provider-status"],
  { revalidate: CHARTS_TTL, tags: ["status"] },
);

export async function getDashboardDataController(range: DateRange = "30d") {
  const { provider } = await getCurrentProvider();
  if (!provider) {
    throw new Error("Provider not authenticated");
  }
  const providerId = provider.id;

  const [
    stats,
    recentBookingsResult,
    topProductsResult,
    timeSeriesResult,
    statusBreakdownResult,
    kpisResult,
  ] = await Promise.all([
    getCachedStats(providerId),
    getCachedRecentBookings(providerId),
    getCachedTopProducts(providerId),
    getCachedTimeSeries(providerId, range),
    getCachedStatusBreakdown(providerId),
    getProviderKPIs(providerId, range),
  ]);

  return {
    stats,
    kpis: kpisResult,
    recentBookings: recentBookingsResult,
    topProducts: topProductsResult,
    revenueTimeSeries: timeSeriesResult,
    bookingStatusBreakdown: statusBreakdownResult,
  };
}
