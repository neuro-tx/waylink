import { tryCatch } from "@/lib/handler";
import { bookingsService } from "@/services/bookings.service";

export async function GET() {
  return tryCatch(async () => {
    return await bookingsService.getAllBookings();
  });
}
