import QuickSearch from "@/components/QuickSearch";
import Hero from "@/components/Hero";
import { FeaturedExp } from "@/components/FeaturedExp";
import HowItWorks from "@/components/HowItWork";
import TrustSection from "@/components/TrustSection";

export default function Home() {
  return <div className="w-full overflow-x-hidden min-h-screen relative">
    <Hero />
    <QuickSearch />
    <FeaturedExp />
    <HowItWorks />
    <TrustSection />
  </div>;
}
