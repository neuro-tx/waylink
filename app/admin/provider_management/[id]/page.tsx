import { RevenueAnalytics } from "../../_components/charts/Revenueanalytics";
import { TopHeader } from "../../_components/TopHeader";
import { ProviderInvites } from "@/components/ProviderInvites";
import { ProviderMembers } from "@/components/Providermembers";
import { getProviderDetails } from "@/actions/provider.action";
import { Metadata } from "next";
import { StatusPieChart } from "@/app/provider/_components/charts/StatusPieChart";
import { ServiceStatusChart } from "../../_components/StatusCharts";
import { ErrorState } from "../../_components/ErrorState";

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
  try {
    const { id } = await params;
    const { bookingStatus, data, revenue, servicesStatus } =
      await getProviderDetails(id);

    const { invites, members, provider, status } = data;

    return (
      <div className="w-full overflow-x-hidden px-3 py-6 md:px-6">
        <div className="space-y-5">
          <TopHeader provider={provider} stats={status ?? null} />
          <RevenueAnalytics data={revenue} />
          <ProviderInvites hideAction invites={invites} />
          <ProviderMembers members={members} />
          <ServiceStatusChart data={servicesStatus} />
          <StatusPieChart data={bookingStatus} />
        </div>
      </div>
    );
  } catch (error) {
    return (
      <ErrorState
        title="Failed to load provider details"
        description="An unexpected error occurred while fetching the provider information. Reload the page to try again."
        fullScreen
        error={error}
      />
    );
  }
}

export default page;
