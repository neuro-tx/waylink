import { NotificationsClientPage } from "@/components/NotificationLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications | Provider Dashboard",
  description:
    "Manage booking updates, customer activity, reviews, announcements, and account notifications.",
};

const page = () => {
  return (
    <div className="min-h-screen bg-card/70 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <NotificationsClientPage recipient="user" />
      </div>
    </div>
  );
};

export default page;
