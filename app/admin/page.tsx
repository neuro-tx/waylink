import type { Metadata } from "next";
import DashboardPage from "./_components/DashboardPage";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Monitor platform revenue, bookings, providers, products, and subscriptions.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <DashboardPage />;
}
