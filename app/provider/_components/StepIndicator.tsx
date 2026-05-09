import { cn } from "@/lib/utils";
import { Check, FileText, CalendarDays, MapPin } from "lucide-react";

export interface Step {
  label: string;
  description: string;
  icon: React.ElementType;
}

export const PRODUCT_STEPS: Step[] = [
  { label: "Details", description: "Type, title & pricing", icon: FileText },
  {
    label: "Variants",
    description: "Dates, slots & pricing",
    icon: CalendarDays,
  },
  { label: "Locations", description: "Start, end & stops", icon: MapPin },
];

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3;
  /** compact = header pill style; full = onboarding hero style */
  variant?: "compact" | "full";
}

export function StepIndicator({
  currentStep,
  variant = "compact",
}: StepIndicatorProps) {
  if (variant === "full") {
    return (
      <div className="flex items-start gap-0">
        {PRODUCT_STEPS.map((step, i) => {
          const num = i + 1;
          const isDone = num < currentStep;
          const isCurrent = num === currentStep;

          return (
            <div key={i} className="flex items-start gap-0 flex-1">
              <div className="flex flex-col items-center gap-2 flex-1">
                {/* Circle */}
                <div
                  className={cn(
                    "relative h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 shrink-0",
                    isDone && "bg-primary text-primary-foreground shadow-md",
                    isCurrent &&
                      "bg-primary text-primary-foreground ring-4 ring-primary/25 shadow-md",
                    !isDone &&
                      !isCurrent &&
                      "bg-muted text-muted-foreground border-2 border-border",
                  )}
                >
                  {isDone ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <step.icon className="h-4 w-4" />
                  )}
                  {isCurrent && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary border-2 border-background" />
                  )}
                </div>

                {/* Text */}
                <div className="text-center px-1">
                  <p
                    className={cn(
                      "text-xs font-semibold leading-tight",
                      isCurrent
                        ? "text-foreground"
                        : isDone
                          ? "text-foreground"
                          : "text-muted-foreground",
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 hidden sm:block">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Connector line */}
              {i < PRODUCT_STEPS.length - 1 && (
                <div className="flex items-start pt-5 w-8 shrink-0">
                  <div
                    className={cn(
                      "h-0.5 w-full transition-colors duration-300",
                      num < currentStep ? "bg-primary" : "bg-border",
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  /* ── compact (header pill) ── */
  return (
    <div className="flex items-center gap-1.5">
      {PRODUCT_STEPS.map((step, i) => {
        const num = i + 1;
        const isDone = num < currentStep;
        const isCurrent = num === currentStep;

        return (
          <div key={i} className="flex items-center gap-1.5">
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all",
                  isDone && "bg-primary text-primary-foreground",
                  isCurrent &&
                    "bg-primary text-primary-foreground ring-4 ring-primary/20",
                  !isDone &&
                    !isCurrent &&
                    "bg-muted text-muted-foreground border border-border",
                )}
              >
                {isDone ? <Check className="h-3 w-3" /> : num}
              </div>
              <span
                className={cn(
                  "text-xs font-medium hidden sm:block",
                  isCurrent ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>

            {i < PRODUCT_STEPS.length - 1 && (
              <div
                className={cn(
                  "h-px w-6 transition-colors",
                  num < currentStep ? "bg-primary" : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
