"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";
import { SetupProgress } from "@/lib/all-types";
import { deriveCurrentStep } from "@/lib/helpers";
import { StepIndicator } from "../../_components/StepIndicator";
import { getServiceSetup } from "@/actions/service.action";
import { useProviderContext } from "@/components/providers/ProviderContext";

function useRouteStep(): 1 | 2 | 3 | 4 {
  const pathname = usePathname();
  if (pathname.includes("/details")) return 4;
  if (pathname.includes("/locations")) return 3;
  if (pathname.includes("/variants")) return 2;
  return 1;
}

export default function CreateServiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { type } = useProviderContext();
  const router = useRouter();
  const params = useParams();
  const routeStep = useRouteStep();

  const serviceId = params?.serviceId as string | undefined;
  const isStep1 = routeStep === 1;

  const [progress, setProgress] = useState<SetupProgress | null>(null);

  //  Initial fetch
  useEffect(() => {
    if (!serviceId) return;
    (async () => {
      const res = await getServiceSetup(serviceId);
      setProgress(res ?? null);
    })();
  }, [serviceId]);

  // Refresh whenever a child page fires "setup-progress-updated"
  useEffect(() => {
    async function onProgressUpdate() {
      if (!serviceId) return;
      const res = await getServiceSetup(serviceId);
      setProgress(res ?? null);
    }
    window.addEventListener("setup-progress-updated", onProgressUpdate);
    return () =>
      window.removeEventListener("setup-progress-updated", onProgressUpdate);
  }, [serviceId]);

  const activeStep: 1 | 2 | 3 | 4 = progress
    ? deriveCurrentStep(progress)
    : routeStep;

  function handleBack() {
    if (routeStep === 4 && serviceId)
      return router.push(`/provider/services/create/${serviceId}/locations`);
    if (routeStep === 3 && serviceId)
      return router.push(`/provider/services/create/${serviceId}/variants`);
    if (routeStep === 2) return router.push("/provider/services/create");
    router.back();
  }

  const stepTitles: Record<number, { label: string; sub: string }> = {
    1: { label: "Product Details", sub: "Type, info & base pricing" },
    2: {
      label: "Variants & Pricing",
      sub: "Dates, capacity & per-pax pricing",
    },
    3: { label: "Locations", sub: "Start, end & waypoints" },
    4: {
      label: type === "transport" ? "Transport Details" : "Experience Details",
      sub:
        type === "transport"
          ? "Vehicle, class & schedule info"
          : "Activity type, duration & itinerary",
    },
  };

  const { label, sub } = stepTitles[routeStep];
  const serviceLabel = type === "transport" ? "Transport" : "Experience";

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
            <StepIndicator
              currentStep={activeStep}
              progress={progress}
              variant="compact"
              serviceLabel={serviceLabel}
              serviceId={serviceId}
              productType={type}
            />
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}

export function notifyProgressUpdate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("setup-progress-updated"));
  }
}
