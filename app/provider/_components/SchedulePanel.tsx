"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import {
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  LayoutGrid,
  RefreshCcwDot,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, fmtDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { ScheduleType } from "@/validations";
import { ScheduleDialog } from "./ScheduleDialog";
import { ScheduleCard } from "./ScheduleCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { createSchedules, getServiceVariants } from "@/actions/service.action";
import { Variant } from "@/lib/all-types";
import { useRouter } from "next/navigation";
import { useSetupProgress } from "@/components/providers/SetupProgressProvider";

interface VariantCardProps {
  variant: Variant;
  isSelected: boolean;
  onClick: (variant: Variant) => void;
}

type ActionRes = {
  success: boolean;
  message: string;
};

const STATUS_CONFIG = {
  available: {
    label: "Available",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800",
  },
  sold_out: {
    label: "Sold out",
    className:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800",
  },
  cancelled: {
    label: "Cancelled",
    className:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800",
  },
} as const;

function EmptySchedules() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-3">
      <div className="w-12 h-12 rounded-full bg-muted border border-border flex items-center justify-center">
        <CalendarPlus className="w-5 h-5 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">
          No schedules yet
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Select a variant from the left
          <br />
          to create your first schedule
        </p>
      </div>
    </div>
  );
}

export function SchedulePanel({ serviceId }: { serviceId: string }) {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [schedules, setSchedules] = useState<ScheduleType[]>([]);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { updateProgress } = useSetupProgress();
  const [actionResponse, setActionResponse] = useState<ActionRes | null>(null);

  const loadVariants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getServiceVariants(serviceId);
      if (!res.success) {
        setError(res.error);
        return;
      }
      setVariants(res.result);
    } catch (e) {
      setError("Failed to load variants. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    loadVariants();
  }, [loadVariants]);

  function handleVariantClick(variant: Variant) {
    setSelectedVariant(variant);
    setDialogOpen(true);
  }

  function handleScheduleCreated(schedule: ScheduleType) {
    setSchedules((prev) => [schedule, ...prev]);
  }

  const handleRemoveSchedule = (index: number) => {
    setSchedules((prev) => prev.filter((_, i) => i !== index));
  };

  function submitSchedules() {
    startTransition(async () => {
      if (schedules.length === 0) {
        setActionResponse({
          success: false,
          message: "Please add at least one schedule before submitting.",
        });

        return;
      }

      try {
        setActionResponse(null);

        const res = await createSchedules(serviceId, schedules);
        if (!res.success) {
          setActionResponse({
            success: false,
            message: res.error,
          });
          return;
        }

        setActionResponse({
          success: true,
          message:
            "Schedules created successfully. Redirecting to the review page...",
        });

        updateProgress({
          hasMetadata: true,
        });

        router.push(`/provider/services/${serviceId}/review`);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to create schedules. Please try again.";

        setActionResponse({
          success: false,
          message: message,
        });
      }
    });
  }

  return (
    <div className="w-full px-4 md:px-6 py-8">
      <div className="space-y-2 mb-3">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">
              Schedules
            </h2>
            <p className="mt-1.5 text-muted-foreground">
              Manage departure schedules for your tour variants
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-3 py-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground">Service ID</p>
              <p className="text-xs font-mono text-foreground">{serviceId}</p>
            </div>
          </div>
        </div>

        <div className="py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              {actionResponse && (
                <div
                  className={cn(
                    "flex items-start gap-3 rounded-xl border px-4 py-3 text-sm",
                    actionResponse.success
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400"
                      : "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400",
                  )}
                >
                  {actionResponse.success ? (
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                  ) : (
                    <RefreshCcwDot className="mt-0.5 size-4 shrink-0" />
                  )}

                  <p className="leading-relaxed">{actionResponse.message}</p>
                </div>
              )}
            </div>

            <Button
              onClick={submitSchedules}
              disabled={schedules.length === 0 || isPending}
              size="lg"
              className="min-w-45 cursor-pointer"
            >
              {isPending ? (
                <>
                  <RefreshCcwDot className="mr-2 size-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 size-4" />
                  Submit Schedules
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col h-full bg-background rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
              <CalendarDays className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-[15px] font-medium text-foreground leading-none mb-0.5">
                Schedule manager
              </h1>
              <p className="text-[11px] text-muted-foreground">
                Select a variant to add a schedule
              </p>
            </div>
          </div>
          <Badge
            variant="secondary"
            className="gap-1.5 text-xs bg-muted text-muted-foreground"
          >
            <LayoutGrid className="w-3 h-3" />
            {schedules.length}{" "}
            {schedules.length === 1 ? "schedule" : "schedules"}
          </Badge>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden grid lg:grid-cols-2 xl:grid-cols-[600px_1fr]">
          <div className="flex flex-col border-b border-border bg-background lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0 bg-card">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
                Variants
              </span>
              <Badge variant="outline" className="text-xs h-6">
                {loading ? "—" : variants.length}
              </Badge>
            </div>

            <ScrollArea className="flex-1 max-h-screen lg:max-h-[80dvh]">
              {loading ? (
                <VariantListSkeleton />
              ) : error ? (
                <div className="flex flex-col items-center justify-center p-8">
                  <div className="mb-4 flex size-10 items-center justify-center rounded-full bg-destructive/10">
                    <RefreshCcwDot className="size-5 text-destructive" />
                  </div>

                  <p className="text-sm font-semibold text-foreground">
                    {error}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    We couldn’t load the service variants right now. Try again
                    or refresh the page.
                  </p>

                  <Button
                    onClick={loadVariants}
                    size="sm"
                    className="cursor-pointer mt-3"
                  >
                    <RefreshCcwDot className="size-4" />
                    Try Again
                  </Button>
                </div>
              ) : variants.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No variants found
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5 p-3">
                  {variants.map((variant) => (
                    <VariantCard
                      key={variant.id}
                      variant={variant}
                      isSelected={
                        selectedVariant?.id === variant.id && dialogOpen
                      }
                      onClick={handleVariantClick}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          <div className="flex flex-col bg-muted/20">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0 bg-card">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
                Schedules
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs size-6",
                  schedules.length > 0 &&
                    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800",
                )}
              >
                {schedules.length}
              </Badge>
            </div>

            <ScrollArea className="flex-1 max-h-screen lg:max-h-[80dvh]">
              {schedules.length === 0 ? (
                <EmptySchedules />
              ) : (
                <div className="flex flex-col gap-2.5 p-3">
                  {schedules.map((schedule, i) => {
                    const variant = variants.find(
                      (v) => v.id === schedule.variantId,
                    );
                    return (
                      <ScheduleCard
                        key={i}
                        schedule={schedule}
                        variant={variant}
                        index={schedules.length - i}
                        onRemove={() => handleRemoveSchedule(i)}
                      />
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        {/* Schedule form dialog */}
        <ScheduleDialog
          open={dialogOpen}
          variant={selectedVariant}
          onClose={() => {
            setDialogOpen(false);
            setSelectedVariant(null);
          }}
          onSubmit={handleScheduleCreated}
        />
      </div>
    </div>
  );
}

function VariantCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-3.5 w-52" />
    </div>
  );
}

function VariantListSkeleton() {
  return (
    <div className="flex flex-col gap-2.5 p-3">
      {[1, 2, 3, 4].map((i) => (
        <VariantCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function VariantCard({
  variant,
  isSelected,
  onClick,
}: VariantCardProps) {
  const status = STATUS_CONFIG[variant.status] ?? STATUS_CONFIG.available;

  return (
    <button
      type="button"
      onClick={() => onClick(variant)}
      className={cn(
        "w-full text-left rounded-xl border p-4 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        "relative overflow-hidden group",
        isSelected
          ? "border-foreground bg-muted/30"
          : "border-border bg-card hover:border-foreground/40 hover:bg-muted/40",
      )}
      aria-pressed={isSelected}
    >
      <span
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-all duration-150",
          isSelected
            ? "bg-foreground"
            : "bg-transparent group-hover:bg-foreground/50",
        )}
      />

      <div className="flex items-start justify-between gap-3 mb-3 pl-1">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate leading-snug">
            {variant.name || "Unnamed variant"}
          </p>
          <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
            #{variant.id.slice(0, 13)}
          </p>
        </div>
        <Badge
          variant="outline"
          className={cn("shrink-0 text-[11px] font-medium", status.className)}
        >
          {status.label}
        </Badge>
      </div>

      <div className="flex items-center gap-2 pl-1 text-[12px] text-muted-foreground">
        <CalendarDays className="w-3.5 h-3.5 shrink-0" />
        <span className="font-medium text-foreground">
          {fmtDate(variant.startDate)}
        </span>
        {variant?.endDate && (
          <>
            <span className="text-muted-foreground/60">→</span>
            <span className="font-medium text-foreground">
              {fmtDate(variant.endDate)}
            </span>
          </>
        )}
      </div>
    </button>
  );
}
