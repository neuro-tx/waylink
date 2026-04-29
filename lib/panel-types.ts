import { Pagination, BookingStatus, BookingVariant } from "./all-types";
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
  expired: []
};
