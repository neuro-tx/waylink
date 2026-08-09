import { Metadata } from "next";
import WishlistPage from "./client-view";

export const metadata: Metadata = {
  title: "Wish List",
  description:
    "View your wish list, track items, and manage your saved products.",
};

const page = () => {
  return <WishlistPage />;
};

export default page;
