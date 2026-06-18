import type { Metadata } from "next";
import NotificationCenterPage from "../_components/NotificationsCenterClient";

export const metadata: Metadata = {
  title: "Notification Center",
  description:
    "Manage, view, and track all system notifications including user, provider, and admin messages in real time.",
  robots: {
    index: false,
    follow: false,
  },
};

const page = () => {
  return <NotificationCenterPage />;
};

export default page;
