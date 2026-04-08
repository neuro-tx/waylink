"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ProductDetails, ReviewProduct } from "./ProductDetails";

type ProductViewTab = "details" | "review";

export default function ProductPageView({ productId }: { productId: string }) {
  const searchParams = useSearchParams();

  const activeTab = useMemo<ProductViewTab>(() => {
    const tab = searchParams.get("tab");
    return tab === "review" ? "review" : "details";
  }, [searchParams]);

  return (
    <div className="w-full">
      {activeTab === "review" ? (
        <ReviewProduct productId={productId} />
      ) : (
        <ProductDetails productId={productId} />
      )}
    </div>
  );
}
