"use client";

import { AlertTriangle, Loader2, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

type ErrorStateProps = {
  title?: string;
  description?: string;
  error?: unknown;
  onRetry?: () => void;
  className?: string;
  fullScreen?: boolean;
};

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load the requested information. Please try again.",
  error,
  onRetry,
  className,
  fullScreen = false,
}: ErrorStateProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  function handleRetry() {
    startTransition(() => {
      if (onRetry) {
        onRetry();
        return;
      }

      router.refresh();
    });
  }

  return (
    <div
      className={cn(
        "flex w-full items-center justify-center bg-background p-8",
        fullScreen ? "h-[90svh]" : "min-h-80",
        className,
      )}
    >
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="size-8 text-destructive" />
        </div>

        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>

        {process.env.NODE_ENV === "development" && error instanceof Error && (
          <pre className="mt-5 max-h-40 w-full overflow-auto rounded-sm border border-destructive/20 bg-destructive/10 text-destructive p-2 text-left font-mono text-xs">
            {error.message}
          </pre>
        )}

        <Button onClick={handleRetry} className="mt-6" size="sm">
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Reloading...
            </>
          ) : (
            <>
              <RotateCw className="size-4" />
              Reload page
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
