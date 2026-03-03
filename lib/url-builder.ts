interface TransportURL {
  search: string;
  minPrice: number;
  maxPrice: number;
  directRoute: boolean;
  verified: boolean;
  type: string;
  sort: string;
  page: number;
  limit: number;
  transportClass: string;
}

export default function transportUrlBuilder(params: Partial<TransportURL>) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const url = new URL("/api/transports", baseUrl);

  const {
    directRoute,
    limit,
    maxPrice,
    minPrice,
    page,
    search,
    sort,
    type,
    verified,
    transportClass,
  } = params;

  if (minPrice !== undefined) {
    url.searchParams.append("basePrice[gte]", String(minPrice));
  }
  if (maxPrice !== undefined) {
    url.searchParams.append("basePrice[lte]", String(maxPrice));
  }
  if (type && type!== "all") {
    url.searchParams.append("transportType", type);
  }
  if (search) {
    url.searchParams.append("search", search);
  }
  if (sort && sort !== "recommended") {
    url.searchParams.append("sort", sort);
  }
  if (directRoute) {
    url.searchParams.append("hasDirectRoute", "true");
  }
  if (transportClass) {
    url.searchParams.append("transportClass", transportClass);
  }
  if (verified) {
    url.searchParams.append("isVerified", "true");
  }
  if (page !== undefined) {
    url.searchParams.append("page", String(page));
  }
  if (limit !== undefined) {
    url.searchParams.append("limit", String(limit));
  }

  return url.toString();
}
