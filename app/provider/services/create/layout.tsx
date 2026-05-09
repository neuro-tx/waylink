"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";
import { StepIndicator } from "../../_components/StepIndicator";

function useCurrentStep(): 1 | 2 | 3 {
  const pathname = usePathname();
  if (pathname.includes("/variants")) return 2;
  if (pathname.includes("/location")) return 3;
  return 1;
}

export default function CreateProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const params = useParams();
  const step = useCurrentStep();
  const pathname = usePathname();

  const isStep1 = step === 1;

  function handleBack() {
    const productId = params?.productId as string | undefined;
    if (step === 3 && productId)
      return router.push(`/products/create/${productId}/variants`);
    if (step === 2) return router.push("/products/create");
    router.back();
  }

  const stepTitles: Record<number, { label: string; sub: string }> = {
    1: { label: "Product Details", sub: "Type, info & base pricing" },
    2: {
      label: "Variants & Pricing",
      sub: "Dates, capacity & per-pax pricing",
    },
    3: { label: "Locations", sub: "Start, end & waypoints" },
  };

  const { label, sub } = stepTitles[step];

  return (
    <div className="min-h-screen bg-background w-full">
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-20">
        <div className="w-full px-4 md:px-6 py-6 flex items-center justify-between gap-4">
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
            <StepIndicator currentStep={step} variant="compact" />
          </div>
        </div>
      </div>

      {/* ── Page content ── */}
      {children}
    </div>
  );
}
