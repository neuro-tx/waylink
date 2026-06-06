import { Loader, BarChart3 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-[90vh] flex-col items-center justify-center px-4">
      <Loader className="size-7 animate-spin text-primary" />

      <h2 className="mt-6 text-lg font-semibold">Loading analytics</h2>

      <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
        Gathering revenue, bookings, payouts, ratings, and performance metrics.
      </p>
    </div>
  );
}
