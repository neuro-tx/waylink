import { Loader, BarChart3 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-[90vh] flex-col items-center justify-center px-4">
      <div className="relative">
        <div className="flex size-16 items-center justify-center rounded-2xl border bg-card shadow-sm">
          <BarChart3 className="size-8 text-primary" />
        </div>

        <Loader className="absolute -right-2 -top-2 size-5 animate-spin text-primary" />
      </div>

      <h2 className="mt-6 text-lg font-semibold">Loading analytics</h2>

      <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
        Gathering revenue, bookings, payouts, ratings, and performance metrics.
      </p>
    </div>
  );
}
