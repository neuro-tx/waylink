import { type NextRequest, NextResponse } from "next/server";

import type {
  CustomerSortOption,
  CustomerStatus,
  CustomerSegment,
} from "@/lib/all-types";
import { getCurrentProvider } from "@/lib/provider-auth";
import { getProviderCustomers } from "@/services/customers.service";

const VALID_SORTS = new Set<CustomerSortOption>([
  "newest",
  "oldest",
  "highest_ltv",
  "lowest_ltv",
  "most_orders",
  "recent_order",
]);

const VALID_STATUSES = new Set<CustomerStatus>([
  "active",
  "blocked",
  "churned",
]);

const VALID_SEGMENTS = new Set<CustomerSegment>(["new", "returning", "loyal"]);

function parseSort(raw: string | null): CustomerSortOption {
  return VALID_SORTS.has(raw as CustomerSortOption)
    ? (raw as CustomerSortOption)
    : "newest";
}

export async function getCustomersController(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const { provider } = await getCurrentProvider();
  if (!provider?.id) throw new Error("Unauthorized");

  const rawStatus = searchParams.get("status")?.trim();
  const rawSegment = searchParams.get("segment")?.trim();

  const status =
    rawStatus && VALID_STATUSES.has(rawStatus as CustomerStatus)
      ? (rawStatus as CustomerStatus)
      : null;

  const segment =
    rawSegment && VALID_SEGMENTS.has(rawSegment as CustomerSegment)
      ? (rawSegment as CustomerSegment)
      : null;

  const search = searchParams.get("search")?.trim() || null;
  const sort = parseSort(searchParams.get("sort"));

  const page = Math.max(
    1,
    Number.parseInt(searchParams.get("page") ?? "1", 10),
  );
  const limit = Math.min(
    50,
    Math.max(1, Number.parseInt(searchParams.get("limit") ?? "10", 10)),
  );

  const result = await getProviderCustomers({
    providerId: provider.id,
    page,
    limit,
    status,
    segment,
    search,
    sort,
  });

  return result;
}
