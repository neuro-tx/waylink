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
  { params }: { params: Promise<{ id: string }> },
) {
  return tryCatch(
    req,
    async () => {
      const body = await req.json();
      const id = (await params).id;

      const updated = await reviewController.updateReview(id, body);
      return updated;
    },
    { role: "provider" },
  );
}
