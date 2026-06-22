import React from "react";
import type { Metadata } from "next";
import ProviderClient from "../_components/ProviderClient";

export const metadata: Metadata = {
  title: "Provider Management",
  description:
    "Manage providers, verification status, and platform operations.",
  robots: {
    index: false,
    follow: false,
  },
};

const page = () => {
  return <ProviderClient />;
};

export default page;
