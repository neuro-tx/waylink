"use client";

import { useState, useEffect, useCallback } from "react";
import { CalendarDays, CalendarPlus, LayoutGrid } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, fmtDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { ScheduleType, VariantForm } from "@/validations";
import { ScheduleDialog } from "./ScheduleDialog";
import { ScheduleCard } from "./ScheduleCard";

type Variant = VariantForm & {
  id: string;
};

interface VariantCardProps {
  variant: Variant;
  isSelected: boolean;
  onClick: (variant: Variant) => void;
}

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

interface SchedulePanelProps {
  variantsList: () => Promise<Variant[]>;
}

function EmptySchedules() {
  return (
    <div className="h-full flex-1 flex flex-col items-center justify-center p-8 text-center gap-3">
      <div className="w-12 h-12 rounded-full bg-muted border border-border flex items-center justify-center">
        <CalendarPlus className="w-5 h-5 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">
          No schedules yet
        </p>
        <p className="text-xs text-muted-foreground/70 leading-relaxed">
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

  const loadVariants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // fetch data later
      // setVariants(data);
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

  return (
    <div className="flex flex-col h-full bg-background rounded-2xl border border-border overflow-hidden">
      <header className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-card shrink-0">
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
          {schedules.length} {schedules.length === 1 ? "schedule" : "schedules"}
        </Badge>
      </header>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="flex flex-col w-1/2 border-r border-border min-h-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0 bg-card">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
              Variants
            </span>
            <Badge variant="outline" className="text-xs h-6">
              {loading ? "—" : variants.length}
            </Badge>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <VariantListSkeleton />
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full p-8 gap-3 text-center">
                <p className="text-sm text-destructive">{error}</p>
                <button
                  onClick={loadVariants}
                  className="text-xs text-blue-600 dark:text-blue-400 underline underline-offset-2"
                >
                  Retry
                </button>
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
          </div>
        </div>

        <div className="flex flex-col w-1/2 bg-muted/30 dark:bg-muted/10 min-h-0">
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

          <div className="flex-1 overflow-y-auto min-h-0">
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
                      key={schedule.variantId}
                      schedule={schedule}
                      variant={variant}
                      index={schedules.length - i}
                    />
                  );
                })}
              </div>
            )}
          </div>
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
          <p className="text-sm font-medium text-foreground truncate leading-snug">
            {variant.name || "Unnamed variant"}
          </p>
          <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
            #{variant.id}
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
        <span className="text-muted-foreground/60">→</span>
        <span className="font-medium text-foreground">
          {fmtDate(variant.endDate)}
        </span>
      </div>
    </button>
  );
}
