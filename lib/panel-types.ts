import {
  Pagination,
  BookingStatus,
  BookingVariant,
  TransportType,
  TransportClass,
  ExperienceType,
  DifficultyLevel,
  SetupProgress,
} from "./all-types";
// export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export type PassengerType = "adult" | "child" | "infant";

export interface BookingItem {
  id: string;
  passengerType: PassengerType;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ProviderBookingShape {
  id: string;
  orderNumber: string;
  status: BookingStatus;

  userId: string;
  productId: string;
  variantId: string;
  providerId: string;

  productTitle: string;
  variant: BookingVariant;

  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };

  totalAmount: number;
  currency: string;
  participantsCount: number;

  items: BookingItem[];

  createdAt: string | Date;
  updatedAt: string | Date;
  canceledAt: string | Date | null;
  completedAt: string | Date | null;
}

export interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  expired: number;
  totalRevenue: number;
  pendingRevenue: number;
  currency: string;
}

export type BookingSortOption =
  | "newest"
  | "oldest"
  | "highest_amount"
  | "lowest_amount"
  | "most_participants";

export interface GetBookingsParams {
  providerId: string;
  page?: number;
  limit?: number;
  status?: BookingStatus | null;
  productId?: string | null;
  search?: string | null;
  sort?: BookingSortOption;
}

export interface BookingsApiResponse {
  bookings: ProviderBookingShape[];
  stats: BookingStats;
  pagination: Pagination;
}

export const STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
  expired: [],
};

export interface ProviderStats {
  createdAt: Date;
  updatedAt: Date;
  providerId: string;
  totalProducts: number;
  totalReviews: number;
  avgRating: string | null;
  totalRevenue: number;
  totalBookings: number;
  maxListings: number | null;
  remainingListings: number | null;
  canCreateListing: boolean;
}

export interface LatestBooking {
  id: string;
  createdAt: Date;
  customerName: string;
  image: string | null;
  amount: number;
  status: BookingStatus;
}

export interface TopProduct {
  id: string;
  name: string;
  revenue: number;
  bookings: number;
  avgRating: number;
  lastBookingAt: Date | string | null;
  avgOrders: number;
}

export interface RevenueDataPoint {
  date: Date | string;
  revenue: number;
  bookings: number;
}

export interface BookingStatusBreakdown {
  status: BookingStatus;
  count: number;
  percentage: number;
}

export type GrowthMetric = {
  value: number | null;
  direction: "up" | "down" | "flat" | "n/a";
  formatted: string;
};

export interface ProviderKPIs {
  repeatCustomerRate: number;
  avgRevenuePerBooking: number;
  revenueGrowth: GrowthMetric;
  bookingGrowth: GrowthMetric;
  cancellationRate: number;
}

export interface ProviderDashboardData {
  stats: ProviderStats;
  kpis: ProviderKPIs;
  recentBookings: LatestBooking[];
  topProducts: TopProduct[];
  revenueTimeSeries: RevenueDataPoint[];
  bookingStatusBreakdown: BookingStatusBreakdown[];
}

export type DateRange = "7d" | "30d" | "90d" | "1y";

export interface PreviewService {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  providerId: string;
  description: string | null;
  slug: string;
  status: "active" | "paused" | "draft" | "archived";
  type: "transport" | "experience";
  title: string;
  shortDescription: string | null;
  basePrice: string;
  currency: string | null;
  transport: Transport | null;
  experience: Experience | null;
  setup: SetupProgress | null;
  media: ServiceMedia[];
}

export interface ServiceMedia {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  type: "image" | "video";
  productId: string;
  url: string;
  isCover: boolean;
  displayOrder: number;
}

export interface Experience {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  productId: string;
  experienceType: ExperienceType;
  difficultyLevel: DifficultyLevel | null;
  durationCount: number;
  durationUnit: "hours" | "minutes" | "days";
  included: string[] | null;
  notIncluded: string[] | null;
  requirements: string[] | null;
  ageRestriction: string | null;
}

export interface Transport {
  id: string;
  providerId: string;
  type: "transport";
  title: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  basePrice: string;
  currency: string;
  status: "draft" | "published" | "archived";
  createdAt: string;
  updatedAt: string;
  transportType: TransportType;
  class: TransportClass;
  directroute: boolean;
}

export type Schedule = {
  id: string;
  variantId: string;
  duration: number;
  departureTime: Date;
  arrivalTime: Date;
  checkInTime: string | null;
  createdAt: Date;
  updatedAt: Date;
  stops:
    | {
        locationName: string;
        arrivalTime: string;
        departureTime: string;
      }[]
    | null;
};

export type VariantWithSchedules = {
  id: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
  status: "cancelled" | "available" | "sold_out";
  productId: string;
  startDate: Date;
  endDate: Date | null;
  capacity: number;
  bookedCount: number;
  adultPrice: string;
  childPrice: string;
  infantPrice: string;
  transportSchedules: Schedule[];
};

export interface PayoutSummary {
  grossEarnings: number;
  platformFeeAmount: number;
  platformFeeRate: number;
  netPayout: number;
  pendingPayoutAmount: number;
  nextPayoutDate: Date;
  periodComparison: {
    current: number;
    previous: number;
    changePercent: number;
  };
}

export interface HeatmapCell {
  dayOfWeek: number;
  hour: number;
  count: number;
  hourLabel: string;
  intensity: 0 | 1 | 2 | 3 | 4;
}

export interface PeakBookingHours {
  cells: HeatmapCell[];
  peakDay: string;
  peakHour: string;
  totalBookingsInPeriod: number;
}

export interface RevenueDataPoint {
  date: Date | string;
  revenue: number;
  bookings: number;
}

export interface RevenueOverTime {
  current: RevenueDataPoint[];
  previous: RevenueDataPoint[];
  totalRevenue: number;
  totalBookings: number;
  peakDay: RevenueDataPoint;
  avgDailyRevenue: number;
}
