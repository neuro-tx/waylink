import { getCurrentProvider } from "@/lib/provider-auth";
import { BookingsTable } from "../_components/BookingTable";

export default async function BookingsPage() {
  const { provider } = await getCurrentProvider();
  const providerId = provider?.id;

  if (!providerId) {
    return;
  }

  return (
    <div className="space-y-6 py-6 w-full md:px-6 px-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Bookings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track, confirm, and manage all customer bookings.
        </p>
      </div>

      <BookingsTable providerId={providerId} />
    </div>
  );
}
