"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Users,
  Calendar,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Baby,
  User,
  UserCheck,
  Layers,
  Route,
  Loader,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn, fmtDate, formatDuration } from "@/lib/utils";
import { fmtCurrency } from "@/lib/helpers";
import { getVarinatWithSchedules } from "@/actions/service.action";
import { Schedule, VariantWithSchedules } from "@/lib/panel-types";

interface VariantsPricingSheetProps {
  open: boolean;
  onClose: () => void;
  serviceId: string;
  isTransport: boolean;
}

function fmtTime(d: Date) {
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

const STATUS_MAP = {
  available: {
    label: "Available",
    icon: CheckCircle2,
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800",
    dot: "bg-emerald-500",
  },
  sold_out: {
    label: "Sold out",
    icon: AlertCircle,
    className:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800",
    dot: "bg-amber-500",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    className:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-400 dark:border-red-800",
    dot: "bg-red-500",
  },
};

function ScheduleRow({ schedule }: { schedule: Schedule }) {
  const [expanded, setExpanded] = useState(false);
  const hasStops = schedule.stops && schedule.stops.length > 0;

  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 overflow-hidden">
      <div className="flex items-start gap-3 p-3.5">
        {/* Timeline */}
        <div className="flex flex-col items-center gap-1 pt-0.5 shrink-0">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <div className="w-px flex-1 min-h-6 bg-border" />
          <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
        </div>

        {/* Times */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold tabular-nums">
                {fmtTime(schedule.departureTime)}
              </p>
              <p className="text-[11px] text-muted-foreground">Departure</p>
            </div>
            <div className="flex flex-col items-center gap-0.5 text-muted-foreground">
              <div className="text-[10px] font-medium tabular-nums bg-muted px-2 py-0.5 rounded-full">
                {formatDuration(schedule.duration)}
              </div>
              <div className="w-12 h-px bg-border" />
            </div>
            <div className="space-y-0.5 text-right">
              <p className="text-sm font-semibold tabular-nums">
                {fmtTime(schedule.arrivalTime)}
              </p>
              <p className="text-[11px] text-muted-foreground">Arrival</p>
            </div>
          </div>

          {schedule.checkInTime && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
              <Clock className="w-3 h-3" />
              Check-in at {schedule.checkInTime}
            </div>
          )}
        </div>

        {hasStops && (
          <button
            onClick={() => setExpanded((e) => !e)}
            className="shrink-0 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mt-0.5"
          >
            <Route className="w-3.5 h-3.5" />
            <span>
              {schedule.stops!.length} stop
              {schedule.stops!.length > 1 ? "s" : ""}
            </span>
            {expanded ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        )}
      </div>

      {/* Stops */}
      <AnimatePresence>
        {expanded && hasStops && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/60 px-3.5 py-3 space-y-2">
              {schedule.stops!.map((stop, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">
                      {stop.locationName}
                    </p>
                    <p className="text-[11px] text-muted-foreground tabular-nums">
                      Arr {stop.arrivalTime} · Dep {stop.departureTime}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function VariantCard({
  variant,
  isTransport,
  index,
}: {
  variant: VariantWithSchedules;
  isTransport: boolean;
  index: number;
}) {
  const [showSchedules, setShowSchedules] = useState(false);
  const status = STATUS_MAP[variant.status];
  const occupancy = Math.round((variant.bookedCount / variant.capacity) * 100);
  const remaining = variant.capacity - variant.bookedCount;
  const schedules: Schedule[] = variant.transportSchedules;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: "easeOut" }}
      className="rounded-xl border border-border bg-card/80 hover:bg-card overflow-hidden"
    >
      <div className="px-5 pt-5 pb-4 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold truncate">
                {variant.name ?? `Variant #${variant.id.slice(-6)}`}
              </h3>
              <Badge
                variant="outline"
                className={cn("text-[11px] shrink-0", status.className)}
              >
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full mr-1.5 inline-block",
                    status.dot,
                  )}
                />
                {status.label}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {fmtDate(variant.startDate)}
              </span>
              {variant.endDate && (
                <>
                  <span>→</span>
                  <span>{fmtDate(variant.endDate)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: UserCheck, label: "Adult", price: variant.adultPrice },
            { icon: User, label: "Child", price: variant.childPrice },
            { icon: Baby, label: "Infant", price: variant.infantPrice },
          ].map(({ icon: Icon, label, price }) => (
            <div
              key={label}
              className="rounded-xl bg-muted/40 hover:bg-muted p-3 space-y-1 text-center"
            >
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <Icon className="w-3 h-3" />
                <span className="text-[11px] font-medium">{label}</span>
              </div>
              <p className="text-sm font-bold tabular-nums">
                {fmtCurrency(Number(price))}
              </p>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="w-3 h-3" />
              <span>Capacity</span>
            </div>
            <span className="font-medium tabular-nums">
              {variant.bookedCount}
              <span className="text-muted-foreground font-normal">
                /{variant.capacity}
              </span>
              <span className="text-muted-foreground font-normal ml-1.5">
                · {remaining} left
              </span>
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              className={cn(
                "h-full rounded-full",
                occupancy >= 90
                  ? "bg-red-500"
                  : occupancy >= 70
                    ? "bg-amber-500"
                    : "bg-emerald-500",
              )}
              initial={{ width: 0 }}
              animate={{ width: `${occupancy}%` }}
              transition={{
                duration: 0.6,
                delay: index * 0.06 + 0.2,
                ease: "easeOut",
              }}
            />
          </div>
        </div>
      </div>

      {isTransport && schedules.length > 0 && (
        <>
          <Separator />
          <div className="px-5 py-3">
            <button
              onClick={() => setShowSchedules((s) => !s)}
              className="w-full h-6 flex items-center justify-between text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {schedules.length} schedule{schedules.length > 1 ? "s" : ""}
              </span>
              <motion.span
                animate={{ rotate: showSchedules ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </motion.span>
            </button>

            <AnimatePresence>
              {showSchedules && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 space-y-2">
                    {schedules.map((s) => (
                      <ScheduleRow key={s.id} schedule={s} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </motion.div>
  );
}

export function VariantsPricingSheet({
  open,
  onClose,
  serviceId,
  isTransport = false,
}: VariantsPricingSheetProps) {
  const [variants, setVariants] = useState<VariantWithSchedules[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  // Fetch when sheet opens
  useEffect(() => {
    if (!open) return;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const response = await getVarinatWithSchedules(serviceId);
        if (!response.success) {
          throw new Error(response.error || "Failed to load data");
        }

        setVariants(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [open, serviceId, retryKey]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const available = variants.filter((v) => v.status === "available").length;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-background rounded-t-3xl border-t border-border shadow-2xl overflow-hidden"
            style={{
              y: 0,
              height: "90dvh",
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              damping: 28,
              stiffness: 300,
              mass: 0.8,
            }}
            drag="y"
            dragConstraints={{
              top: 0,
              bottom: 0,
            }}
            dragElastic={{
              top: 0.2,
              bottom: 0.5,
            }}
            onDragEnd={(event, info) => {
              if (info.offset.y > 120 || info.velocity.y > 800) {
                onClose();
                return;
              }
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
            </div>

            {/* Sheet header */}
            <div className="px-5 pt-2 pb-4 shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-muted-foreground" />
                    <h2 className="text-base font-semibold">
                      Variants & Pricing
                    </h2>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {loading ? (
                      <span className="inline-block h-3.5 w-32 rounded bg-muted animate-pulse" />
                    ) : error ? (
                      <span className="text-red-500">
                        Could not load variants
                      </span>
                    ) : (
                      <>
                        {variants.length} variant
                        {variants.length !== 1 ? "s" : ""}
                        {available > 0 && (
                          <span className="text-emerald-600 dark:text-emerald-400 ml-1.5">
                            · {available} available
                          </span>
                        )}
                      </>
                    )}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <Separator />

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">
              {loading ? (
                <div className="flex flex-col h-full items-center justify-center py-16 space-y-4">
                  <Loader className="w-8 h-8 animate-spin text-primary" />

                  <div className="text-center space-y-1">
                    <p className="text-sm font-medium">Loading variants...</p>
                    <p className="text-xs text-muted-foreground">
                      Please wait a moment
                    </p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex flex-col h-full items-center justify-center py-16 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      Failed to load
                    </p>
                    <p className="text-xs text-muted-foreground">{error}</p>
                  </div>
                  <button
                    onClick={() => setRetryKey((n) => n + 1)}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Try again
                  </button>
                </div>
              ) : variants.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-2">
                  <Layers className="w-8 h-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    No variants added yet
                  </p>
                </div>
              ) : (
                variants.map((variant, i) => (
                  <VariantCard
                    key={variant.id}
                    variant={variant}
                    isTransport={isTransport}
                    index={i}
                  />
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
