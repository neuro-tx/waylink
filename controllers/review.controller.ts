import { getAuthSession } from "@/lib/auth-server";
import { reviewService } from "@/services/review.service";
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

export const reviewController = { newReview };
