import {
  ExperienceDetails,
  Itinerary,
  ProductDetails,
  ProductReview,
  ProductVariant,
  TransportDetails,
} from "@/lib/all-types";
import { useEffect, useState } from "react";

type States = "idle" | "loading" | "error" | "success";

export default function useProduct(productId: string) {
  const [product, setProduct] = useState<ProductDetails>();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [transportDetails, setTransportDetails] =
    useState<TransportDetails | null>(null);
  const [exeperinceDetails, setExeperinceDetails] =
    useState<ExperienceDetails | null>(null);
  const [state, setState] = useState<States>("idle");

  const fetchProduct = async () => {
    setState("loading");
    const mainUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    try {
      const res = await fetch(`${mainUrl}/api/product/${productId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch product");
      }
      const data = await res.json();
      setProduct(data.data);
      setReviews(data.data.reviews);
      setVariants(data.data.variants);
      setTransportDetails(data.data.transport);
      setExeperinceDetails(data.data.experince);
      setState("success");
    } catch (error) {
      console.error(error);
      setState("error");
    }
  };

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  return {
    product,
    reviews,
    variants,
    state,
    transportDetails,
    exeperinceDetails,
  };
}
