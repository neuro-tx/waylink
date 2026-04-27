import { Metadata } from "next";
import CustomersClient from "../_components/CustomersClient";

export const metadata: Metadata = {
  title: "Customers Dashboard",
  description:
    "Manage your customer base, track revenue, lifetime value, and customer activity.",
};

export default async function Page() {
  return <CustomersClient />;
}
