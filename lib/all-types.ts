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
export type ProviderStatus = "pending" | "approved" | "inactive" | "suspended";

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
  createdAt: string;
  updatedAt: string;
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
