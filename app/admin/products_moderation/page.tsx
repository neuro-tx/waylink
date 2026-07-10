import { Metadata } from "next";

import ProductsModerationPage from "../_components/ProductsModerationPage";

export const metadata: Metadata = {
  title: "Product Moderation",
  description:
    "Review, approve, reject, and manage submitted products from providers before they become publicly available.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ProductModerationPage() {
  return <ProductsModerationPage />;
}
