import { Metadata } from "next";
import ProviderServicesClient from "../_components/ProviderServicesClient";

export const metadata: Metadata = {
  title: "Manage Your Services | Provider Dashboard",
  description:
    "Create, edit, and manage your services, transport listings, and experiences. Control availability, pricing, and visibility from your dashboard.",
  openGraph: {
    title: "Manage Your Services | Provider Dashboard",
    description:
      "Easily manage your services, transport, and experiences in one place.",
    type: "website",
  },
};

const page = () => {
  return (
    <ProviderServicesClient />
  );
};

export default page;
