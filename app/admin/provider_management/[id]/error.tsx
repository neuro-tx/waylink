"use client";

import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[75vh] items-center justify-center">
      <div className="max-w-md text-center">
        <AlertTriangle className="mx-auto mb-4 size-12 text-destructive" />

        <h2 className="text-xl font-semibold">
          Failed to load provider details
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          {error.message ||
            "Something went wrong while fetching this provider."}
        </p>

        <Button onClick={reset} variant="outline" className="mt-6">
          <RotateCw className="size-4" />
          Try again
        </Button>
      </div>
    </div>
  );
}
