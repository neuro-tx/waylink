"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { SetupProgressProvider } from "@/components/providers/SetupProgressProvider";
import { ServiceLayoutContent } from "../../_components/ServiceLayoutContent";
import { hasReachedListingLimit } from "@/actions/plans.action";
import { AlertCircle, ArrowRight, Loader, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type LimitStatus =
  | { status: "loading" }
  | { status: "allowed" }
  | { status: "blocked"; message?: string }
  | { status: "error"; message: string };

export default function CreateServiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const serviceId = typeof params.id === "string" ? params.id : undefined;

  const [retryKey, setRetryKey] = useState(0);
  const [limitStatus, setLimitStatus] = useState<LimitStatus>({
    status: "loading",
  });

  useEffect(() => {
    let mounted = true;

    async function checkLimit() {
      setLimitStatus({ status: "loading" });
      const res = await hasReachedListingLimit();

      if (!mounted) return;
      if (!res.success) {
        setLimitStatus({
          status: "error",
          message: res.error ?? "Failed to check subscription",
        });
        return;
      }

      if (res.data) {
        setLimitStatus({
          status: "blocked",
          message:
            "You’ve reached your listing limit. Upgrade your plan to continue.",
        });
        return;
      }

      setLimitStatus({ status: "allowed" });
    }

    checkLimit();

    return () => {
      mounted = false;
    };
  }, [retryKey]);

  if (limitStatus.status !== "allowed") {
    return (
      <LimitScreen>
        {limitStatus.status === "loading" && (
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <Loader className="h-5 w-5 animate-spin text-muted-foreground" />

            <p className="text-sm text-muted-foreground">
              Checking your subscription...
            </p>
          </div>
        )}

        {limitStatus.status === "error" && (
          <div className="flex flex-col items-center justify-center text-center space-y-4 max-w-md">
            <div className="rounded-full bg-red-500/10 p-3">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>

            <div className="space-y-1">
              <p className="text-lg font-semibold text-destructive">
                Unable to verify subscription
              </p>

              <p className="text-sm text-muted-foreground">
                {limitStatus.message}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => setRetryKey((k) => k + 1)}
                variant="outline"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>

              <Button asChild>
                <Link href="/provider/subscription">
                  Go to subscriptions
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        )}

        {limitStatus.status === "blocked" && (
          <div className="text-center space-y-3 max-w-md">
            <p className="text-xl font-semibold text-amber-600 italic">
              Listing limit reached
            </p>
            <p className="text-sm text-muted-foreground">
              {limitStatus.message}
            </p>

            <Button asChild variant="outline">
              <Link href="/provider/plans">
                Upgrade plan
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </LimitScreen>
    );
  }

  return (
    <SetupProgressProvider serviceId={serviceId}>
      <ServiceLayoutContent>{children}</ServiceLayoutContent>
    </SetupProgressProvider>
  );
}

function LimitScreen({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-[90dvh] flex items-center justify-center px-4 md:px-6">
      {children}
    </div>
  );
}
