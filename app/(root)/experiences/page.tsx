import ExperiencePageClient from "@/components/pages/ExperiencePage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Experiences — WayLink | Tours, Adventures & Cultural Activities",
  description:
    "Discover 4,800+ handpicked experiences worldwide. Book guided tours, food & drink adventures, cultural activities, wildlife encounters and more — all in one place.",
  keywords: [
    "experience booking",
    "guided tours",
    "adventure travel",
    "cultural activities",
    "food tours",
    "wildlife experiences",
    "wellness retreats",
    "photography tours",
    "WayLink experiences",
  ],
};

export default function ExperiencePage() {
  return <ExperiencePageClient />;
}
