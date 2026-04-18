export interface Product {
  id: string;
  providerId: string;
  type: "experience" | "transport";
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  basePrice: string;
  currency: string;
  status: "active" | "inactive" | "draft";
  createdAt: string;
  updatedAt: string;
  finalScore: number;
  media: Media[];
  locations: Location[];
}

export interface Media {
  id: string;
  url: string;
  type: "image" | "video";
  is_cover: boolean;
  display_order: number;
  product_id: string;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  city: string;
  slug: string;
  type: "start" | "end" | "stop";
  address: string;
  country: string;
  latitude: number;
  longitude: number;
  product_id: string;
  created_at: string;
  updated_at: string;
}

export type BusinessType = "individual" | "company" | "agency";
export type ServiceType = "transport" | "experience";
export type ProviderStatus =
  | "pending"
  | "approved"
  | "inactive"
  | "suspended"
  | "rejected";

export type Provider = {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  cover: string | null;
  serviceType: ServiceType;
  businessType: "individual" | "company" | "agency";
  address: string | null;
  status: ProviderStatus;
  isVerified: boolean;
  businessPhone: string | null;
  businessEmail: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type TransportType =
  | "bus"
  | "flight"
  | "train"
  | "ferry"
  | "cruise"
  | "car_rental"
  | "shuttle"
  | "taxi"
  | "private_van"
  | "helicopter";

export type TransportClass =
  | "economy"
  | "business"
  | "first_class"
  | "premium_economy"
  | "vip";

export type Transport = {
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
  score: number;
  transportType: TransportType;
  class: TransportClass;
  directroute: boolean;
  reviews: number;
  bookings: number;
  avgRate: string;
  locations: Location[];
  provider: Pick<Provider, "id" | "name" | "logo" | "isVerified">;
};

export type ProductCardProps = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  basePrice: string;
  currency: string;
  avgRate: string;
  reviews: number;
  type: "experience" | "transport";
  bookings: number;
  media: Media[];
  locations: Location[];
  provider: Pick<Provider, "id" | "name" | "logo" | "isVerified">;
};

export interface Limitation {
  limit: number;
  offset: number;
  page?: number;
}

export type SpotlightProvider = Provider & {
  totalProducts: number;
  totalBookings: number;
  avgRating: string;
  totalReviews: number;
};

export interface Pagination {
  total: number;
  limit: number;
  offset: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export type ExperienceType =
  | "tour"
  | "adventure"
  | "cultural"
  | "entertainment"
  | "food_drink"
  | "sports"
  | "wellness"
  | "water"
  | "wildlife"
  | "photography"
  | "nature"
  | "shopping"
  | "nightlife"
  | "learning"
  | "seasonal";

export type DifficultyLevel = "easy" | "moderate" | "challenging" | "extreme";

export interface Wishlist {
  id: string;
  userId?: string;
  name: string;
  description: string;
  isPrivate: boolean;
  color: string;
  totalItems: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WishlistItem {
  id: string;
  wishlistId: string;
  itemType: "experience" | "transport";
  itemId: string;
  notes: string | null;
  productId: string;
  title: string;
  basePrice: number;
  type: "experience" | "transport";
  reviews: number;
  bookings: number;
  avgRate: number;
  media: Media[];
  locations: Location[];
}

export type NotificationType =
  | "booking_confirmed"
  | "booking_cancelled"
  | "booking_completed"
  | "review_received"
  | "provider_approved"
  | "provider_rejected"
  | "provider_invite"
  | "provider_suspended"
  | "system_announcement"
  | "system_warning"
  | "promotion"
  | "general";

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null | undefined;
  banned: boolean | null | undefined;
  role?: string | null | undefined;
  banReason?: string | null | undefined;
  banExpires?: Date | null | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "expired";
export type PassengerType = "adult" | "child" | "infant";
export type ProductType = "experience" | "transport";
export type ProductStatus = "draft" | "active" | "inactive";
export type VariantStatus = "available" | "sold_out" | "cancelled";

export interface BookingItem {
  id: string;
  bookingId: string;
  passengerType: PassengerType;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingVariant {
  id: string;
  productId: string;
  name: string | null;
  startDate: string;
  endDate: string | null;
  capacity: number;
  bookedCount: number;
  status: VariantStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  productId: string;
  providerId: string;
  variantId: string;
  orderNumber: string;
  participantsCount: number;
  hasReviewed: boolean;
  totalAmount: string;
  currency: string;
  status: BookingStatus;
  canceledAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: BookingItem[];
  variant: BookingVariant;
  product: Product;
  user?: User;
}

export interface Session {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  expiresAt: Date;
  token: string;
  ipAddress?: string | null | undefined;
  userAgent?: string | null | undefined;
}

export type ProviderStats = {
  totalServices: number;
  avgRating: string;
  totalReviews: number;
  fiveStar: number;
  fourStar: number;
  threeStar: number;
  twoStar: number;
  oneStar: number;
};

export type Pricing = {
  variantId: string;
  adultPrice: string;
  childPrice: string;
  infantPrice: string;
};

export type ProductVariant = {
  id: string;
  productId: string;
  name: string | null;
  startDate: string | Date;
  endDate: string | Date;
  capacity: number;
  bookedCount: number;
  status: VariantStatus;
  pricing: Pricing | null;
  transportSchedule?: {
    departureTime: string | Date;
    arrivalTime: string | Date;
    duration: number;
    checkInTime: string | null;
    stops:
      | {
          locationName: string;
          arrivalTime: string;
          departureTime: string;
        }[]
      | null;
  } | null;
};

export type ProductReview = {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string | null;
  isVerified: boolean;
  providerResponse: string | null;
  respondedAt: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
};

export type Itinerary = {
  id: string;
  experienceId: string;
  dayNumber: number;
  title: string;
  description: string;
  activities: string[] | null;
  mealsIncluded: string[] | null;
  accommodationInfo: string | null;
};

export type SeatType =
  | "standard"
  | "reclining"
  | "semi_sleeper"
  | "sleeper"
  | "bed"
  | "cabin"
  | "premium"
  | "vip"
  | "window"
  | "aisle";

export type ExperienceDetails = {
  productId: string;
  experienceType: ExperienceType;
  difficultyLevel: DifficultyLevel | null;
  durationCount: string | number;
  durationUnit: "hours" | "minutes" | "days";
  included: string[] | null;
  notIncluded: string[] | null;
  requirements: string[] | null;
  ageRestriction: string | null;
  itineraries: Itinerary[];
};

export type TransportDetails = {
  productId: string;
  transportType: TransportType;
  distance: number | null;
  hasDirectRoute: boolean;
  transportClass: TransportClass | null;
  seatType: SeatType | null;
  amenities: string[] | null;
  luggageAllowance: string | null;
  extraLuggageFee: string | number | null;
  departureAddress: string | null;
  arrivalAddress: string | null;
  importantNotes: string[] | null;
};

export interface ProductDetails extends Product {
  provider: Pick<Provider, "id" | "name" | "logo" | "isVerified">;
  stats: {
    bookingsCount: number;
    reviewsCount: number;
    averageRating: string | null;
  };
}

export type PlanTier = "free" | "pro" | "business" | "enterprise";
export type PlanBillingCycle = "monthly" | "yearly";
export type SubscriptionStatus = "active" | "cancelled" | "expired" | "trialing";

export interface Plan {
  id: string;
  name: string;
  tier: PlanTier;
  price: string;
  isFree:boolean;
  priorityBoost: string;
  featuredInSearch: boolean;
  badgeLabel: string | null;
  billingCycle: PlanBillingCycle;
  commissionRate: string;
  maxListings: number | null;
  description: string | null;
  isActive: boolean;
  highlights: string[] | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  providerId: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  trialUsed: boolean;
  listingsCount: number;
  cancelledAt: Date | null;
  autoRenew: boolean;
  createdAt: Date;
  updatedAt: Date;
  plan?: Plan;
}

export interface SubscribePayload {
  planId: string;
  billingCycle: PlanBillingCycle;
  paymentMethodId?: string;
}

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}