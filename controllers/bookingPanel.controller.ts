import { BookingStatus } from "@/lib/all-types";
import { BookingSortOption } from "@/lib/panel-types";
import { getCurrentProvider } from "@/lib/provider-auth";
import { getProviderBookings } from "@/services/bookingPanel.service";
import { NextRequest } from "next/server";

const VALID_SORTS = new Set<BookingSortOption>([
  "newest",
  "oldest",
  "highest_amount",
  "lowest_amount",
  "most_participants",
]);
const VALID_STATUSES = new Set<BookingStatus>([
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "expired"
]);

export async function getBookingsController(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const { provider } = await getCurrentProvider();
  if (!provider?.id) throw new Error("Missing required param: provider");

  const rawStatus = searchParams.get("status");
  const status =
    rawStatus && VALID_STATUSES.has(rawStatus as BookingStatus)
      ? (rawStatus as BookingStatus)
      : null;

  const productId = searchParams.get("productId") || null;
  const search = searchParams.get("search")?.trim() || null;
  const rawSort = searchParams.get("sort");
  const sort: BookingSortOption =
    rawSort && VALID_SORTS.has(rawSort as BookingSortOption)
      ? (rawSort as BookingSortOption)
      : "newest";

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(
    50,
    Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)),
  );

  const result = await getProviderBookings({
    providerId: provider.id,
    page,
    limit,
    status,
    productId,
    search,
    sort,
  });

  return result;
}
