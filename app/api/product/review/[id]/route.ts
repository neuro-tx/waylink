import { reviewController } from "@/controllers/review.controller";
import { tryCatch } from "@/lib/handler";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  return tryCatch(
    req,
    async () => {
      const id = params.id;

      const deleted = await reviewController.deleteReview(id);
      return deleted;
    },
    { role: "provider" },
  );
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  return tryCatch(
    req,
    async () => {
      const body = req.json();
      const id = params.id;

      await reviewController.updateReview(id, body);
    },
    { role: "provider" },
  );
}
