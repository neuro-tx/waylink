import {
  ExperienceDetails,
  Itinerary,
  ProductDetails,
  ProductReview,
  ProductVariant,
  TransportDetails,
} from "@/lib/all-types";
import { useCallback, useEffect, useState } from "react";

type State = "idle" | "loading" | "error" | "success";

interface ProductState {
  product: ProductDetails | undefined;
  reviews: ProductReview[];
  variants: ProductVariant[];
  transportDetails: TransportDetails | null;
  experienceDetails: ExperienceDetails | null;
}

const INITIAL_STATE: ProductState = {
  product: undefined,
  reviews: [],
  variants: [],
  transportDetails: null,
  experienceDetails: null,
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function useProduct(productId: string) {
  const [data, setData] = useState<ProductState>(INITIAL_STATE);
  const [state, setState] = useState<State>("idle");

  const fetchProduct = useCallback(async (signal: AbortSignal) => {
    setState("loading");
    try {
      const res = await fetch(`${API_BASE}/api/product/${productId}`, { signal });
      if (!res.ok) throw new Error("Failed to fetch product");

      const json = await res.json();
      const d = json.data;

      setData({
        product: d,
        reviews: d.reviews ?? [],
        variants: d.variants ?? [],
        transportDetails: d.transport ?? null,
        experienceDetails: d.experience ?? null,
      });
      setState("success");
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      console.error(error);
      setState("error");
    }
  }, [productId]);

  useEffect(() => {
    if (!productId) return;
    const controller = new AbortController();
    fetchProduct(controller.signal);
    return () => controller.abort();
  }, [productId, fetchProduct]);

  return { ...data, state, refetch: () => fetchProduct(new AbortController().signal) };
}