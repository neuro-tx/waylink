import React from "react";
import PlansPage from "../_components/Planspage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plans Management | Admin",
  description:
    "Create, update, and manage subscription plans, pricing, commissions, listing limits, trials, and plan availability across the platform.",
};

const page = () => {
  return <PlansPage />;
};

export default page;
