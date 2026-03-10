import TopRatingPageClient from "@/components/pages/TopRatingPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore — WayLink | Experiences & Transport Worldwide",
  description:
    "Discover the world's best experiences and transport in one place. Tours, adventures, flights, trains, cruises and more — curated across 120+ destinations.",
  keywords: [
    "travel experiences",
    "transport booking",
    "guided tours",
    "flights",
    "trains",
    "adventure travel",
    "cultural experiences",
    "WayLink explore",
  ]
};

export default function TopRatingPage() {
  return <TopRatingPageClient />;
}