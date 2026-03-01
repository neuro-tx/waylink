import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWork";
import TrustSection from "@/components/TrustSection";
import QuickSearch from "@/components/QuickSearch";
import FeaturedTransport from "@/components/FeaturedTransports";
import { FeaturedExperinces } from "@/components/FeaturedExperinces";
import BecomeProvider from "@/components/BecomeProvider";
import ProvidersSpotlight from "@/components/Providersspotlight";

export default function Home() {
  return <div className="w-full overflow-x-hidden min-h-screen relative bg-waylink-fade">
    <Hero />
    <QuickSearch />
    <FeaturedExperinces />
    <FeaturedTransport />
    <ProvidersSpotlight />
    <HowItWorks />
    <BecomeProvider />
    <TrustSection />
  </div>;
}
