import QuickSearch from "@/components/QuickSearch";
import Hero from "@/components/Hero";
import TrustStats from "@/components/TrustStats";
import { FeaturedExp } from "@/components/FeaturedExp";

export default function Home() {
  return <div className="w-full overflow-x-hidden min-h-screen relative">
    <Hero />
    <QuickSearch />
    <FeaturedExp />
    <TrustStats />
  </div>;
}
