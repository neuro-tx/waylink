import { tryCatch } from "@/lib/handler";
import { bookingsService } from "@/services/bookings.service";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return tryCatch(req, async () => {
    return await bookingsService.getAllBookings();
  });
}
