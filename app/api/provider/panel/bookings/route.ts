import { getBookingsController } from "@/controllers/bookingPanel.controller";
import { tryCatch } from "@/lib/handler";
import { type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return tryCatch(
    req,
    async () => {
      const res = await getBookingsController(req);
      return res;
    },
    { role: "provider" },
  );
}
