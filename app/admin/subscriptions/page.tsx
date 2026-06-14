import React from "react";
import SubscriptionsClient from "../_components/SubscriptionsClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subscriptions | Admin Dashboard",
  description:
    "Monitor provider subscriptions, track revenue performance, and analyze plan adoption across the platform.",
  robots: {
    index: false,
    follow: false,
  },
};

const page = () => {
  return (
    <div className="w-full relative">
      <div className="space-y-5 px-4 md:px-6 py-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Subscriptions
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitor provider subscriptions, revenue, and plan adoption.
          </p>
        </div>

        <SubscriptionsClient />
      </div>
    </div>
  );
};

export default page;
