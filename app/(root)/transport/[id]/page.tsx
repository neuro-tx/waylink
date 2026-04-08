import ProductPageView from "@/components/details/DetailsWrapper";
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
        <ProductPageView productId={id} />
      </div>
    );
}