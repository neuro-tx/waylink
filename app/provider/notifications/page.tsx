import { NotificationsClientPage } from "@/components/NotificationLayout";
import { getCurrentProvider } from "@/lib/provider-auth";
import { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Notifications | Provider Dashboard",
  description:
    "View booking updates, customer activity, reviews, announcements, and account notifications.",
};

const page = async () => {
  const { provider } = await getCurrentProvider();

  if (!provider) return <MissingState />;

  return (
    <div className="transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <NotificationsClientPage
          recipient="provider"
          recipientId={provider?.id}
        />
      </div>
    </div>
  );
};

function MissingState() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <ShieldAlert className="text-amber-500" size={22} />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-foreground">
            Provider profile not found
          </h1>

          <p className="text-sm text-muted-foreground leading-relaxed">
            We couldn’t load your session. Please refresh the page or try again
            later.
          </p>
        </div>

        <div className="block">
          <Link
            href="/provider"
            className="text-sm text-muted-foreground hover:text-foreground transition hover:underline"
          >
            Back to dashboard{" "}
            <ArrowRight className="inline-block ml-1" size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default page;
