import { Metadata } from "next";
import ProviderDetailsClient from "../../_components/ProviderDetailsClient";

export const metadata: Metadata = {
  title: "Provider Details",
  description:
    "View and manage provider information, team members, invitations, services, bookings, reviews, and account status.",
  robots: {
    index: false,
    follow: false,
  },
};

type Params = {
  params: Promise<{
    id: string;
  }>;
};

async function page({ params }: Params) {
  const { id } = await params;

  return <ProviderDetailsClient providerId={id} />;
}

export default page;
