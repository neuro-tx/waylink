import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-[70svh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="size-8 animate-spin text-primary" />
        <div className="space-y-1 text-center">
          <h2 className="font-medium">Loading provider details...</h2>
          <p className="text-sm text-muted-foreground">
            Fetching analytics, members, services and revenue.
          </p>
        </div>
      </div>
    </div>
  );
}
