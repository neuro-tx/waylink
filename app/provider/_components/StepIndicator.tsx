import { useProviderContext } from "@/components/providers/ProviderContext";
import { cn } from "@/lib/utils";
import { Check, FileText, CalendarDays, MapPin, Settings2 } from "lucide-react";

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
  {
    label: "Service",
    description: "Type-specific configuration",
    icon: Settings2,
  },
];

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3 | 4;
  variant?: "compact" | "full";
  serviceLabel?: string;
}

export function StepIndicator({
  currentStep,
  variant = "compact",
  serviceLabel,
}: StepIndicatorProps) {
  const { config } = useProviderContext();

  const steps = PRODUCT_STEPS.map((s, i) =>
    i === 3 && serviceLabel ? { ...s, label: serviceLabel } : s,
  );

  const activeClasses = `${config.twBgColor} text-white`;
  const ringClasses = `ring-4 ring-blue-200 dark:ring-blue-900/40`;

  if (variant === "full") {
    return (
      <div className="flex items-start">
        {steps.map((step, i) => {
          const num = i + 1;
          const isDone = num < currentStep;
          const isCurrent = num === currentStep;

          return (
            <div key={i} className="flex items-start flex-1">
              <div className="flex flex-col items-center gap-2 flex-1">
                <div
                  className={cn(
                    "relative h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 shrink-0",
                    (isDone || isCurrent) && activeClasses,
                    isCurrent && ringClasses,
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
                    <span
                      className={cn(
                        "absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-background",
                        config.twBgColor,
                      )}
                    />
                  )}
                </div>

                <div className="text-center px-1">
                  <p
                    className={cn(
                      "text-xs font-semibold leading-tight",
                      isCurrent || isDone
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

              {i < steps.length - 1 && (
                <div className="flex items-start pt-5 w-8 shrink-0">
                  <div
                    className={cn(
                      "h-0.5 w-full transition-colors duration-300",
                      num < currentStep ? config.twBgColor : "bg-border",
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

  return (
    <div className="flex items-center gap-1.5">
      {steps.map((step, i) => {
        const num = i + 1;
        const isDone = num < currentStep;
        const isCurrent = num === currentStep;

        return (
          <div key={i} className="flex items-center gap-1.5">
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all",
                  (isDone || isCurrent) && activeClasses,
                  isCurrent && ringClasses,
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
                  isCurrent ? config.twTextColor : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>

            {i < steps.length - 1 && (
              <div
                className={cn(
                  "h-px w-5 transition-colors",
                  num < currentStep ? config.twBgColor : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
