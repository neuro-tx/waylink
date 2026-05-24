"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader, Sparkles } from "lucide-react";
import { deriveCurrentStep, isFullyComplete } from "@/lib/helpers";
import { StepIndicator } from "./StepIndicator";
import { useProviderContext } from "@/components/providers/ProviderContext";
import { useSetupProgress } from "@/components/providers/SetupProgressProvider";

function useRouteStep(): 1 | 2 | 3 | 4 {
  const pathname = usePathname();
  if (pathname.includes("/details")) return 4;
  if (pathname.includes("/locations")) return 3;
  if (pathname.includes("/variants")) return 2;
  return 1;
}

const STEP_TITLES: Record<number, { label: string; sub: string }> = {
  1: { label: "Product Details", sub: "Type, info & base pricing" },
  2: { label: "Variants & Pricing", sub: "Dates, capacity & per-pax pricing" },
  3: { label: "Locations", sub: "Start, end & waypoints" },
  4: { label: "", sub: "" },
};

export function ServiceLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { type } = useProviderContext();
  const router = useRouter();
  const params = useParams();
  const routeStep = useRouteStep();

  const serviceId = typeof params.id === "string" ? params.id : undefined;
  const isStep1 = routeStep === 1;

  const { loading, progress } = useSetupProgress();

  const activeStep =
    !loading && progress ? deriveCurrentStep(progress) : undefined;
  const isComplete = !loading && isFullyComplete(progress);

  if (loading) {
    return (
      <div className="h-[90dvh] w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader className="h-8 w-8 animate-spin text-primary" />

          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Preparing service...
            </p>
            <p className="text-xs text-muted-foreground">
              Please wait a moment
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isComplete) {
    const scoreState = progress?.hasScore;

    return (
      <div className="h-[90dvh] flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center space-y-3 max-w-md">
            <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-emerald-500" />
            </div>

            <h2 className="text-lg font-semibold text-emerald-500">
              {scoreState
                ? "We are calculating your service score"
                : "Your submission is being reviewed"}
            </h2>

            <p className="text-sm leading-relaxed">
              {scoreState ? (
                <>
                  After we finish calculating your score, your service will be
                  automatically published and visible to customers.
                </>
              ) : (
                <>
                  This process may take some time. Your service will be sent to
                  our admin team for review, and we will notify you once it is
                  approved or if any changes are needed.
                </>
              )}
            </p>

            <Button
              variant="outline"
              onClick={() =>
                router.push(`/provider/services/${serviceId}/review`)
              }
            >
              View Service
            </Button>
          </div>
        </div>
      </div>
    );
  }

  function handleBack() {
    if (routeStep === 4 && serviceId)
      return router.push(`/provider/services/create/${serviceId}/locations`);
    if (routeStep === 3 && serviceId)
      return router.push(`/provider/services/create/${serviceId}/variants`);
    if (routeStep === 2) return router.push("/provider/services/create");
    router.back();
  }

  const serviceLabel = type === "transport" ? "Transport" : "Experience";

  const stepTitle =
    routeStep === 4
      ? {
          label:
            type === "transport" ? "Transport Details" : "Experience Details",
          sub:
            type === "transport"
              ? "Vehicle, class & schedule info"
              : "Activity type, duration & itinerary",
        }
      : STEP_TITLES[routeStep];

  const { label, sub } = stepTitle;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-20">
        <div className="w-full px-4 md:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {!isStep1 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={handleBack}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}

            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                New Product
              </p>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold text-foreground leading-none truncate">
                  {label}
                </h1>
                <span className="text-xs text-muted-foreground hidden md:block truncate">
                  — {sub}
                </span>
              </div>
            </div>
          </div>

          <div className="shrink-0">
            {activeStep && (
              <StepIndicator
                currentStep={activeStep}
                progress={progress}
                variant="compact"
                serviceLabel={serviceLabel}
                serviceId={serviceId}
              />
            )}
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}
