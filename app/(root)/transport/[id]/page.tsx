import ProductDetails from "@/components/details/ProductDetails";
import React from "react";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;

    return (
      <div className="w-full min-h-dvh">
        <ProductDetails productId={id} />
      </div>
    );
}