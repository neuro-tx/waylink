import { reviewController } from "@/controllers/review.controller";
import { tryCatch } from "@/lib/handler";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return tryCatch(
    req,
    async () => {
      const res = await reviewController.getReviewsController(req);
      return res;
    },
    { role: "provider" },
  );
}
