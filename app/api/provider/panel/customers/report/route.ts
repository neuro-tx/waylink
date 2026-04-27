import { exportCustomersCsvController } from "@/controllers/customers.controller";
import { aj } from "@/lib/arcjet";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const decision = await aj("provider").protect(req, { requested: 1 });
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
    
    return await exportCustomersCsvController();
  } catch (error: any) {
    console.error("[EXPORT_CUSTOMERS]", error);

    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to export customers",
      },
      { status: 500 },
    );
  }
}
