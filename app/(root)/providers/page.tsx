import ProvidersPageClient from "@/components/pages/ProvidersPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trusted Travel Partners | Providers — WayLink",
  description:
    "Discover WayLink's network of verified travel providers. Browse experiences, transport operators and tour guides across 120+ destinations.",
  keywords: [
    "travel providers",
    "tour operators",
    "transport companies",
    "verified guides",
    "WayLink partners",
  ],
};

export default function ProvidersPage() {
    return <ProvidersPageClient />;
}
