import { reviewController } from "@/controllers/review.controller";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    await reviewController.newReview(body);

    return NextResponse.json(
      { message: "Review created successfully" },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error?.message || "Something went wrong",
      },
      { status: 400 },
    );
  }
}
