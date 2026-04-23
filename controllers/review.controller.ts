import { getAuthSession } from "@/lib/auth-server";
import { reviewService, ReviewSortOption } from "@/services/review.service";
import { NextRequest } from "next/server";
import z from "zod";

const schema = z.object({
  productId: z.string().uuid(),
  comment: z.string().min(1).max(1000),
  rating: z.number().min(1).max(5),
});

const newReview = async (input: unknown) => {
  const session = await getAuthSession();
  const userId = session?.user?.id;

  if (!userId) throw new Error("Unauthorized");

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  const { productId, comment, rating } = parsed.data;

  await reviewService.createReview(userId, productId, comment, rating);
};

const VALID_SORTS = new Set<ReviewSortOption>([
  "newest",
  "oldest",
  "highest",
  "lowest",
]);

function parseSort(raw: string | null): ReviewSortOption {
  return VALID_SORTS.has(raw as ReviewSortOption)
    ? (raw as ReviewSortOption)
    : "newest";
}

async function getReviewsController(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const providerId = searchParams.get("provider");
  if (!providerId) throw new Error("Missing required param: provider");

  const productId =
    searchParams.get("tab") !== "all"
      ? (searchParams.get("tab") ?? searchParams.get("productId"))
      : null;

  const rawRating = searchParams.get("rating");
  const rating =
    rawRating && rawRating !== "all" ? parseInt(rawRating, 10) : null;
  if (rating !== null && (isNaN(rating) || rating < 1 || rating > 5))
    throw new Error("rating must be 1–5");

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(
    50,
    Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)),
  );
  const sort = parseSort(searchParams.get("sort"));

  const result = await reviewService.getProviderReviews({
    providerId,
    page,
    limit,
    productId,
    rating,
    sort,
  });

  return result;
}

export const reviewController = { newReview, getReviewsController };
