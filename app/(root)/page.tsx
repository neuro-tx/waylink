import QuickSearch from "@/components/QuickSearch";
import Hero from "@/components/Hero";
import TrustStats from "@/components/TrustStats";
import { FeaturedExp } from "@/components/FeaturedExp";
import HowItWorks from "@/components/HowItWork";

export default function Home() {
  return <div className="w-full overflow-x-hidden min-h-screen relative">
    <Hero />
    <QuickSearch />
    <FeaturedExp />
    <HowItWorks />
    <TrustStats />
  </div>;
}
