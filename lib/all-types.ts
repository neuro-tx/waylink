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

export type Provider = {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  cover: string | null;
  serviceType: "transport" | "experience";
  businessType: "individual" | "company" | "agency";
  address: string | null;
  status: "pending" | "approved" | "rejected";
  isVerified: boolean;
  businessPhone: string | null;
  businessEmail: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FeaturedTransport = {
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
  transportType: string;
  class: string;
  directroute: boolean;
  reviews: number;
  bookings: number;
  avgRate: string;
  locations: Location[];
  provider: Pick<Provider, "id" | "name" | "logo" | "isVerified">;
};
