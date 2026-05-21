"use client";

import { Badge } from "@/components/ui/badge";
import { Variant } from "@/lib/all-types";
import { formatDuration, formatTo12Hour } from "@/lib/utils";
import { ScheduleType } from "@/validations";
import {
  PlaneTakeoff,
  PlaneLanding,
  Clock,
  DoorOpen,
  MapPin,
} from "lucide-react";

interface ScheduleCardProps {
  schedule: ScheduleType;
  variant?: Variant;
  index: number;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ScheduleCard({ schedule, variant, index }: ScheduleCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-foreground leading-snug">
          {schedule.label || `Schedule ${index}`}
        </p>
        {variant && (
          <Badge
            variant="secondary"
            className="text-[11px] bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800 shrink-0 max-w-40 truncate"
          >
            {variant.name || variant.id}
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[12px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <PlaneTakeoff className="w-3.5 h-3.5 shrink-0" />
          <span className="font-medium text-foreground">
            {formatDate(schedule.departureDate)}
          </span>
        </span>
        <span className="flex items-center gap-1.5">
          <PlaneLanding className="w-3.5 h-3.5 shrink-0" />
          <span className="font-medium text-foreground">
            {formatDate(schedule.arrivalDate)}
          </span>
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-start gap-2 rounded-lg border border-border/70 bg-muted/40 hover:bg-muted/70 transition-colors px-3 py-2 flex-1">
          <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />

          <div className="leading-none">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
              Duration
            </p>

            <p className="text-sm font-semibold text-foreground">
              {formatDuration(Number(schedule.duration))}
            </p>
          </div>
        </div>

        {schedule.checkInTime && (
          <div className="flex items-start gap-2 rounded-xl border border-border/70 bg-muted/40 hover:bg-muted/70 transition-colors px-3 py-2 flex-1">
            <DoorOpen className="w-4 h-4 text-orange-600 dark:text-orange-400" />

            <div className="leading-none">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
                Check-in
              </p>

              <p className="text-sm font-semibold text-foreground">
                {formatTo12Hour(schedule.checkInTime)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Stops */}
      {schedule.stops && schedule.stops.length > 0 && (
        <div className="pt-3 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {schedule.stops && schedule.stops.length > 0 && (
              <div className="pt-4 border-t border-border space-y-3 w-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center size-8 rounded-full bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    </div>

                    <div>
                      <p className="text-xs font-medium text-foreground">
                        Route Stops
                      </p>

                      <p className="text-[10px] text-muted-foreground">
                        {schedule.stops.length} stop
                        {schedule.stops.length > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative pl-3">
                  <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />

                  <div className="space-y-1">
                    {schedule.stops.map((stop, i) => (
                      <div key={i} className="relative flex w-full">
                        <div className="relative z-10 -left-3 flex items-center justify-center size-4 rounded-full border-2 border-background bg-blue-500 shadow-sm" />

                        <div className="flex-1 rounded-xl border border-border/70 bg-muted/30 hover:bg-muted/50 transition-colors p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <span className="flex items-center justify-center size-6 rounded-full bg-background border border-border text-xs font-semibold text-muted-foreground">
                                  {i + 1}
                                </span>

                                <p className="text-sm font-semibold text-foreground">
                                  {stop.locationName}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="rounded-lg border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/40 px-2.5 py-1.5 text-center min-w-20">
                                <p className="text-xs font-medium uppercase tracking-wide text-green-700 dark:text-green-400">
                                  Arrival
                                </p>

                                <p className="text-xs font-semibold text-green-900 dark:text-green-100">
                                  {formatTo12Hour(stop.arrivalTime)}
                                </p>
                              </div>

                              <div className="rounded-lg border border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/40 px-2.5 py-1.5 text-center min-w-20">
                                <p className="text-xs font-medium uppercase tracking-wide text-orange-700 dark:text-orange-400">
                                  Departure
                                </p>

                                <p className="text-xs font-semibold text-orange-900 dark:text-orange-100">
                                  {formatTo12Hour(stop.departureTime)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
