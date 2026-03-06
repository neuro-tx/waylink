import { DifficultyLevel, ExperienceType } from "./all-types";

interface SharedPrams {
  search: string;
  minPrice: number;
  maxPrice: number;
  verified: boolean;
  sort: string;
  page: number;
  limit: number;
}

interface TransportURL extends SharedPrams {
  directRoute: boolean;
  type: string;
  transportClass: string;
}

interface ExperienceURL extends SharedPrams {
  difficulty: DifficultyLevel | undefined;
  expType: ExperienceType | "all";
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
  if (type && type !== "all") {
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

export function experienceUrlBuilder(params: Partial<ExperienceURL>) {
  const {
    difficulty,
    expType,
    limit,
    maxPrice,
    minPrice,
    page,
    search,
    sort,
    verified,
  } = params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const url = new URL("/api/experinces", baseUrl);

  if (difficulty !== undefined) {
    url.searchParams.append("difficultyLevel", difficulty);
  }
  if (expType !== undefined && expType !== "all") {
    url.searchParams.append("experienceType", expType);
  }
  if (minPrice !== undefined) {
    url.searchParams.append("basePrice[gte]", String(minPrice));
  }
  if (maxPrice !== undefined) {
    url.searchParams.append("basePrice[lte]", String(maxPrice));
  }
  if (search) {
    url.searchParams.append("search", search);
  }
  if (sort && sort !== "recommended") {
    url.searchParams.append("sort", sort);
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
