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
