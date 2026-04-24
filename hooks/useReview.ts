import { useState } from "react";

type UpdateReviewInput = {
  comment?: string;
  rating?: number;
  providerResponse?: string;
};

export function useReview() {
  const [error, setError] = useState<string | null>(null);

  const mainUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const create = async (productId: string, comment: string, rating: number) => {
    try {
      setError(null);

      const res = await fetch(`${mainUrl}/api/product/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          comment,
          rating,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to create review");
      }

      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const update = async (reviewId: string, payload: UpdateReviewInput) => {
    try {
      setError(null);

      const res = await fetch(`${mainUrl}/api/product/review/${reviewId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || "Failed to update review");
      }

      return json.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const remove = async (reviewId: string) => {
    try {
      setError(null);
      const res = await fetch(`${mainUrl}/api/product/review/${reviewId}`, {
        method: "DELETE",
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || "Failed to delete review");
      }

      return json.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    create,
    error,
  };
}
