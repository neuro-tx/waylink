import { reviewController } from "@/controllers/review.controller";
import { aj } from "@/lib/arcjet";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const decision = await aj().protect(req, { requested : 1});
    if (decision.isDenied()) {
      let message = "Your request couldn’t be processed right now.";

      if (decision.reason?.isRateLimit?.()) {
        message =
          "You're sending requests too quickly. Please slow down and try again.";
      } else if (decision.reason?.isBot?.()) {
        message = "Automated access is not allowed. use the app normally.";
      } else if (decision.reason?.isShield?.()) {
        message =
          "This request looks unsafe and has been blocked for your protection.";
      }

      throw new Error(message);
    }

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
