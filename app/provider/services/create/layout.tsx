"use client";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";
import { StepIndicator } from "../../_components/StepIndicator";
import { useProviderContext } from "@/components/providers/ProviderContext";

function useCurrentStep(): 1 | 2 | 3 | 4 {
  const pathname = usePathname();
  if (pathname.includes("/details")) return 4;
  if (pathname.includes("/location")) return 3;
  if (pathname.includes("/variants")) return 2;
  return 1;
}

export default function CreateProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const step = useCurrentStep();
  const {type} = useProviderContext();

  const productId = params.get("serviceId") as string | undefined;
  const isStep1 = step === 1;

  function handleBack() {
    if (step === 4 && productId)
      return router.push(
        `/provider/services/create/location?serviceId=${productId}`,
      );
    if (step === 3 && productId)
      return router.push(`/provider/services/create/variants?serviceId=${productId}`);
    if (step === 2) return router.push("/provider/services/create");
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
      label:
        type === "transport"
          ? "Transport Details"
          : "Experience Details",
      sub:
        type === "transport"
          ? "Vehicle, class & schedule info"
          : "Activity type, duration & itinerary",
    },
  };

  const { label, sub } = stepTitles[step];

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
              currentStep={step}
              variant="compact"
              serviceLabel={type}
            />
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}
