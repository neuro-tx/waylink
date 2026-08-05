import { Suspense } from "react";
import ReviewClient from "./review-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Write a Review",
  description:
    "Share your experience and help other customers make informed purchasing decisions by leaving a product review.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    productId?: string;
    userId?: string;
  }>;
}) {
  const params = await searchParams;

  return (
    <ReviewClient
      productId={params.productId ?? ""}
      userId={params.userId ?? ""}
    />
  );
}