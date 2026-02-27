import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWork";
import TrustSection from "@/components/TrustSection";
import QuickSearch from "@/components/QuickSearch";
import FeaturedTransport from "@/components/FeaturedTransports";
import { FeaturedExperinces } from "@/components/FeaturedExperinces";

export default function Home() {
  return <div className="w-full overflow-x-hidden min-h-screen relative">
    <Hero />
    <QuickSearch />
    <FeaturedExperinces />
    <FeaturedTransport />
    <HowItWorks />
    <TrustSection />
  </div>;
}
