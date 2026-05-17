"use client";

import { cn } from "@/lib/utils";
import {
  Check,
  X,
  FileText,
  CalendarDays,
  MapPin,
  Settings2,
  ImageIcon,
  LucideIcon,
  Eye,
} from "lucide-react";
import { useProviderContext } from "@/components/providers/ProviderContext";
import { useRouter } from "next/navigation";
import { SetupProgress } from "@/lib/all-types";
import { isFullyComplete } from "@/lib/helpers";

export interface Step {
  label: string;
  description: string;
  icon: LucideIcon;
  progressKey: keyof SetupProgress | null;
}

export const PRODUCT_STEPS: Step[] = [
  {
    label: "Details",
    description: "Type, title & pricing",
    icon: FileText,
    progressKey: "mainInfo",
  },
  {
    label: "Variants",
    description: "Dates, slots & pricing",
    icon: CalendarDays,
    progressKey: "hasVariants",
  },
  {
    label: "Locations",
    description: "Start, end & stops",
    icon: MapPin,
    progressKey: "hasLocation",
  },
  {
    label: "Service",
    description: "Type-specific configuration",
    icon: Settings2,
    progressKey: "hasMetadata",
  },
  {
    label: "Review",
    description: "All data & publishing",
    icon: Eye,
    progressKey: "hasScore",
  },
];

type StepState = "done" | "current" | "incomplete" | "untouched";

function resolveStepState(
  i: number,
  progress: SetupProgress | null | undefined,
  routeStep: number,
): StepState {
  const step = PRODUCT_STEPS[i];
  const key = step.progressKey;

  if (key && progress && progress[key] === true) return "done";

  if (i + 1 === routeStep) return "current";
  if (progress) {
    const previousDone =
      i === 0
        ? true
        : (() => {
            const prevKey = PRODUCT_STEPS[i - 1].progressKey;
            return prevKey ? !!progress[prevKey] : false;
          })();
    if (previousDone && key && !progress[key]) return "incomplete";
  }

  return "untouched";
}

function stepUrl(i: number, productId: string | undefined): string | null {
  if (!productId && i > 0) return null;
  switch (i) {
    case 0:
      return "/provider/services/create";
    case 1:
      return `/provider/services/create/${productId}/variants`;
    case 2:
      return `/provider/services/create/${productId}/locations`;
    case 3:
      return `/provider/services/create/${productId}/details`;
    case 4:
      return `/provider/services/view/${productId}`;
    default:
      return null;
  }
}

const STATE_STYLES = {
  done: {
    circle:
      "bg-emerald-500 text-white border-2 border-emerald-500 shadow-sm shadow-emerald-500/20",
    ring: "",
    label: "text-emerald-600 dark:text-emerald-400",
    connector: "bg-emerald-400",
  },
  current: {
    circle: "",
    ring: "ring-4 ring-blue-200 dark:ring-blue-900/40",
    label: "",
    connector: "bg-border",
  },
  incomplete: {
    circle: "bg-amber-500/10 text-amber-500 border-2 border-amber-500/60",
    ring: "",
    label: "text-amber-600 dark:text-amber-400",
    connector: "bg-border",
  },
  untouched: {
    circle: "bg-muted text-muted-foreground border border-border",
    ring: "",
    label: "text-muted-foreground",
    connector: "bg-border",
  },
} as const;

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3 | 4 | 5;
  progress?: SetupProgress | null;
  variant?: "compact" | "full";
  serviceLabel?: string;
  serviceId?: string;
}

function MediaPill({
  hasMedia,
  compact,
}: {
  hasMedia: boolean;
  compact: boolean;
}) {
  const base = hasMedia
    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
    : "bg-muted border-border text-muted-foreground/60";

  if (compact) {
    return (
      <span
        title={hasMedia ? "Media uploaded" : "No media yet"}
        className={cn(
          "inline-flex items-center justify-center size-5 rounded-full border",
          base,
        )}
      >
        <ImageIcon className="h-3 w-3" />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[9px] font-medium rounded-full px-1.5 py-0.5 border mt-1",
        base,
      )}
    >
      <ImageIcon className="h-2 w-2" />
      {hasMedia ? "Media ready" : "No media"}
    </span>
  );
}

export function StepIndicator({
  currentStep,
  progress,
  variant = "compact",
  serviceLabel,
  serviceId,
}: StepIndicatorProps) {
  const { config } = useProviderContext();
  const router = useRouter();

  const brandBg = config?.twBgColor ?? "bg-primary";
  const brandText = config?.twTextColor ?? "text-primary";

  const steps = PRODUCT_STEPS.map((s, i) =>
    i === 3 && serviceLabel ? { ...s, label: serviceLabel } : s,
  );

  function handleStepClick(i: number) {
    const url = stepUrl(i, serviceId);
    if (url) router.push(url);
  }

  function connectorDone(i: number): boolean {
    const key = PRODUCT_STEPS[i].progressKey;
    return !!(key && progress && progress[key]);
  }

  if (variant === "full") {
    return (
      <div className="flex items-start w-full">
        {steps.map((step, i) => {
          const state = resolveStepState(i, progress, currentStep);
          const styles = STATE_STYLES[state];
          const isMedia = i === 0;
          const url = stepUrl(i, serviceId);
          const canClick = !!url;

          const circleClass = cn(
            "relative h-11 w-11 rounded-full flex items-center justify-center",
            "transition-all duration-300 shrink-0",
            state === "current"
              ? cn(brandBg, "text-white border-2 shadow-sm", styles.ring)
              : styles.circle,
            canClick && "cursor-pointer hover:opacity-80 active:scale-95",
          );

          return (
            <div key={i} className="flex items-start flex-1">
              <div className="flex flex-col items-center gap-2 flex-1">
                <div
                  className={circleClass}
                  onClick={() => canClick && handleStepClick(i)}
                  role={canClick ? "button" : undefined}
                  tabIndex={canClick ? 0 : undefined}
                  onKeyDown={(e) =>
                    e.key === "Enter" && canClick && handleStepClick(i)
                  }
                  aria-label={`Go to ${step.label}`}
                >
                  {state === "done" && <Check className="h-4 w-4" />}
                  {state === "incomplete" && <X className="h-4 w-4" />}
                  {(state === "current" || state === "untouched") && (
                    <step.icon className="h-4 w-4" />
                  )}

                  {state === "current" && !isFullyComplete(progress) && (
                    <span
                      className={cn(
                        "absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full",
                        "border-2 border-background animate-pulse",
                        brandBg,
                      )}
                    />
                  )}
                </div>

                <div className="text-center px-1">
                  <p
                    className={cn(
                      "text-xs font-semibold leading-tight transition-colors",
                      state === "done" &&
                        "text-emerald-600 dark:text-emerald-400",
                      state === "current" && brandText,
                      state === "incomplete" &&
                        "text-amber-600 dark:text-amber-400",
                      state === "untouched" && "text-muted-foreground",
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 hidden sm:block">
                    {step.description}
                  </p>
                  <p
                    className={cn(
                      "text-[9px] font-medium mt-0.5 hidden sm:block",
                      state === "done" && "text-emerald-500",
                      state === "incomplete" && "text-amber-500",
                      (state === "current" || state === "untouched") &&
                        "hidden",
                    )}
                  >
                    {state === "done" && "Complete"}
                    {state === "incomplete" && "Incomplete"}
                  </p>
                  {isMedia && progress && (
                    <MediaPill hasMedia={progress.hasMedia} compact={false} />
                  )}
                </div>
              </div>

              {i < steps.length - 1 && (
                <div className="flex items-start pt-5.5 w-10 shrink-0">
                  <div
                    className={cn(
                      "h-0.5 w-full transition-colors duration-500",
                      connectorDone(i) ? "bg-emerald-400" : "bg-border",
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
    <div className="flex items-center gap-1">
      {steps.map((step, i) => {
        const state = resolveStepState(i, progress, currentStep);
        const url = stepUrl(i, serviceId);
        const canClick = !!url;
        const isMedia = i === 0;

        const circleClass = cn(
          "h-6 w-6 rounded-full flex items-center justify-center",
          "text-xs font-bold transition-all duration-200 shrink-0",
          state === "done" && "bg-emerald-500 text-white",
          state === "current" &&
            cn(
              brandBg,
              "text-white ring-4 ring-blue-200 dark:ring-blue-900/40",
            ),
          state === "incomplete" &&
            "bg-amber-500/15 text-amber-500 border border-amber-500/50",
          state === "untouched" &&
            "bg-muted text-muted-foreground border border-border",
          canClick && "cursor-pointer hover:opacity-75 active:scale-95",
        );

        return (
          <div key={i} className="flex items-center gap-1">
            <div
              className="flex items-center gap-1.5"
              onClick={() => canClick && handleStepClick(i)}
              role={canClick ? "button" : undefined}
              tabIndex={canClick ? 0 : undefined}
              onKeyDown={(e) =>
                e.key === "Enter" && canClick && handleStepClick(i)
              }
              aria-label={`Go to ${step.label}`}
              title={
                state === "done"
                  ? `${step.label} — Complete`
                  : state === "incomplete"
                    ? `${step.label} — Incomplete`
                    : state === "current"
                      ? `${step.label} — In progress`
                      : `${step.label}`
              }
            >
              <div className={circleClass}>
                {state === "done" && <Check className="h-3 w-3" />}
                {state === "incomplete" && <X className="h-3 w-3" />}
                {(state === "current" || state === "untouched") && i + 1}
              </div>

              <span
                className={cn(
                  "text-xs font-medium hidden sm:block transition-colors",
                  state === "done" && "text-emerald-600 dark:text-emerald-400",
                  state === "current" && brandText,
                  state === "incomplete" &&
                    "text-amber-600 dark:text-amber-400",
                  state === "untouched" && "text-muted-foreground",
                )}
              >
                {step.label}
              </span>

              {isMedia && progress && (
                <MediaPill hasMedia={progress.hasMedia} compact />
              )}
            </div>

            {i < steps.length - 1 && (
              <div
                className={cn(
                  "h-px w-5 shrink-0 transition-colors duration-500 mx-0.5",
                  connectorDone(i) ? "bg-emerald-400" : "bg-border/60",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
