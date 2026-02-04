import { LocationType } from "@/validations";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generates a URL-friendly slug from text
 * Example: "New York City" -> "new-york-city"
 */
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
};

/**
 * Calculates distance between two coordinates in kilometers
 * Uses Haversine formula
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

/**
 * Converts degrees to radians
 */
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Formats coordinates for display
 * Example: 40.7128, -74.0060 -> "40.7128° N, 74.0060° W"
 */
export const formatCoordinates = (
  latitude: number,
  longitude: number,
): string => {
  const latDirection = latitude >= 0 ? "N" : "S";
  const lonDirection = longitude >= 0 ? "E" : "W";

  return `${Math.abs(latitude).toFixed(4)}° ${latDirection}, ${Math.abs(longitude).toFixed(4)}° ${lonDirection}`;
};

export const getGoogleMapsUrl = (
  latitude: number,
  longitude: number,
): string => {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
};

const exportToCSV = (locations: LocationType[]): string => {
  const headers = [
    "ID",
    "City",
    "Country",
    "Latitude",
    "Longitude",
    "Slug",
    "Address",
  ];
  const rows = locations.map((loc) => [
    loc.id,
    loc.city,
    loc.country,
    loc.latitude,
    loc.longitude,
    loc.slug,
    loc.address || "",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  return csvContent;
};

export const downloadLocationsCSV = (
  locations: LocationType[],
  filename = "locations.csv",
): void => {
  const csvContent = exportToCSV(locations);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
