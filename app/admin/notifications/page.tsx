import { NotificationsClientPage } from "@/components/NotificationLayout";
import { adminAuth } from "@/lib/admin-auth";
import Link from "next/link";
import { ShieldAlert, ArrowRight } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications | Admin Dashboard",
  description:
    "View system updates, user activity, reports, and admin notifications.",
};

const page = async () => {
  const { admin, status } = await adminAuth();
  if (!admin || status !== "ok") return <MissingState />;

  return (
    <div className="transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <NotificationsClientPage recipient="admin" recipientId={admin.id} />
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
            Admin session not found
          </h1>

          <p className="text-sm text-muted-foreground leading-relaxed">
            We couldn’t load your admin session. Please log in again or refresh
            the page.
          </p>
        </div>

        <div className="block">
          <Link
            href="/admin"
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
