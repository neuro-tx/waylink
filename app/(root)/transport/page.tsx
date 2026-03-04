import type { Metadata } from "next";
import TransportPageClient from "@/components/pages/TransportPage";

export const metadata: Metadata = {
  title: "Transport — WayLink | Flights, Trains, Ferries & More",
  description:
    "Browse 1,200+ transport routes worldwide. Book flights, trains, buses, ferries, private transfers and luxury cruises — all in one place.",
  keywords: [
    "transport booking",
    "flights",
    "trains",
    "ferry",
    "cruise",
    "shuttle",
    "private van",
    "helicopter transfer",
    "travel routes",
    "WayLink transport",
  ],
};

export default function TransportPage() {
  return <TransportPageClient />;
}
