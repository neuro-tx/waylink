"use client";

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  HeatmapCell,
  PeakBookingHours,
  StatusItem,
  StatusType,
} from "@/lib/panel-types";

interface PeakBookingHeatmapProps {
  data: PeakBookingHours;
  statusBars: StatusItem[];
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const INTENSITY_LABELS = [
  "No Activity",
  "Low",
  "Moderate",
  "Busy",
  "Peak",
] as const;

const STATUS_COLORS: Record<StatusType, string> = {
  active: "bg-emerald-500",
  draft: "bg-yellow-500",
  paused: "bg-orange-500",
  archived: "bg-red-500",
};

const getIntensityColor = (intensity: number) => {
  switch (intensity) {
    case 4:
      return "bg-orange-500 dark:bg-orange-500 z-10";
    case 3:
      return "bg-orange-400/80 dark:bg-orange-500/80";
    case 2:
      return "bg-orange-400/50 dark:bg-orange-500/50";
    case 1:
      return "bg-orange-400/25 dark:bg-orange-500/25";
    default:
      return "bg-orange-400/5 outline outline-[0.5px] outline-border/50";
  }
};

interface CellProps {
  cell: HeatmapCell;
  isHovered: boolean;
  isDimmed: boolean;
  animDelay: number;
  onEnter: (cell: HeatmapCell, e: React.MouseEvent<HTMLDivElement>) => void;
  onLeave: () => void;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
}

function HeatCell({
  cell,
  isHovered,
  isDimmed,
  animDelay,
  onEnter,
  onLeave,
  onMouseMove,
}: CellProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      role="gridcell"
      aria-label={`${DAYS_OF_WEEK[cell.dayOfWeek]} at ${cell.hourLabel}: ${cell.count} bookings`}
      initial={reduceMotion ? false : { opacity: 0, scale: 0.5 }}
      animate={{
        opacity: isDimmed ? 0.5 : 1,
        scale: 1,
        zIndex: isHovered ? 20 : 1,
      }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : {
              opacity: { duration: 0.2, delay: animDelay },
              scale: {
                type: "spring",
                stiffness: 400,
                damping: 20,
                delay: isHovered ? 0 : animDelay,
              },
            }
      }
      onMouseEnter={(e) => onEnter(cell, e)}
      onMouseMove={onMouseMove}
      onMouseLeave={onLeave}
      className={cn(
        "w-full aspect-square min-w-3.5 rounded-sm cursor-crosshair outline-none relative transition-shadow duration-200",
        getIntensityColor(cell.intensity),
      )}
    />
  );
}

function CellTooltip({
  state,
  totalInPeriod,
}: {
  state: { cell: HeatmapCell; x: number; y: number };
  totalInPeriod: number;
}) {
  const { cell, x, y } = state;
  const pct =
    totalInPeriod > 0 ? ((cell.count / totalInPeriod) * 100).toFixed(1) : "0.0";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 5, scale: 0.95 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      style={{
        position: "fixed",
        left: x,
        top: y,
        transform: "translate(-50%, calc(-100% - 12px))",
        zIndex: 999,
        pointerEvents: "none",
        minWidth: 180,
      }}
      className="bg-popover text-popover-foreground border border-border/60 rounded-xl shadow-xl px-3.5 py-3 backdrop-blur-md"
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className={cn(
            "w-2.5 h-2.5 rounded-sm shadow-sm",
            getIntensityColor(cell.intensity),
          )}
        />
        <span className="text-sm font-semibold leading-none tracking-tight">
          {DAYS_OF_WEEK[cell.dayOfWeek]}, {cell.hourLabel}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center gap-4">
          <span className="text-xs text-muted-foreground">Bookings</span>
          <span className="text-xs font-bold tabular-nums">
            {cell.count.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center gap-4">
          <span className="text-xs text-muted-foreground">Activity</span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            {INTENSITY_LABELS[cell.intensity]}
          </span>
        </div>
        {cell.count > 0 && (
          <div className="pt-2 mt-2 border-t border-border/40">
            <div className="flex justify-between items-center gap-4">
              <span className="text-xs text-muted-foreground">
                Share of total
              </span>
              <span className="text-xs font-semibold tabular-nums text-orange-500">
                {pct}%
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function PeakBookings({ data, statusBars }: PeakBookingHeatmapProps) {
  const [tooltip, setTooltip] = useState<{
    cell: HeatmapCell;
    x: number;
    y: number;
  } | null>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cellMap = useMemo(() => {
    const map = new Map<string, HeatmapCell>();
    data.cells.forEach((cell) =>
      map.set(`${cell.dayOfWeek}-${cell.hour}`, cell),
    );
    return map;
  }, [data.cells]);

  const handleEnter = useCallback(
    (cell: HeatmapCell, e: React.MouseEvent<HTMLDivElement>) => {
      if (hideTimer.current) clearTimeout(hideTimer.current);

      setHoveredKey(`${cell.dayOfWeek}-${cell.hour}`);

      const rect = e.currentTarget.getBoundingClientRect();

      setTooltip({
        cell,
        x: rect.left + rect.width / 2,
        y: rect.top,
      });
    },
    [],
  );

  const handleLeave = useCallback(() => {
    hideTimer.current = setTimeout(() => {
      setHoveredKey(null);
      setTooltip(null);
    }, 55);
  }, []);

  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setTooltip((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        x: e.clientX,
        y: e.clientY,
      };
    });
  }, []);

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  return (
    <div className="w-full bg-background text-foreground rounded-xl border shadow-sm p-6 sm:p-8 grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-[500px_1fr] gap-5">
      <ServicesStatusBars data={statusBars} />

      <div className="flex flex-col min-w-0 bg-muted/10 border border-border/50 rounded-lg p-4">
        <div className="overflow-hidden pb-4 relative flex-1 w-full">
          <div className="w-full relative">
            <div
              className="mb-2 grid items-end gap-1.5"
              style={{
                gridTemplateColumns: `36px repeat(24, minmax(14px, 1fr))`,
              }}
            >
              <div />
              {Array.from({ length: 24 }).map((_, hour) => (
                <div
                  key={hour}
                  className="text-center pb-1 text-[10px] sm:text-xs font-medium text-muted-foreground"
                >
                  {hour % 3 === 0
                    ? hour === 0
                      ? "12AM"
                      : hour < 12
                        ? `${hour}AM`
                        : hour === 12
                          ? "12PM"
                          : `${hour - 12}PM`
                    : ""}
                </div>
              ))}
            </div>

            <div className="space-y-1.5">
              {DAYS_OF_WEEK.map((dayLabel, dayIndex) => (
                <div
                  key={dayLabel}
                  className="grid items-center gap-1"
                  style={{
                    gridTemplateColumns: `36px repeat(24, minmax(14px, 1fr))`,
                  }}
                >
                  <div className="text-xs sm:text-xs font-medium text-muted-foreground text-right pr-2">
                    {dayLabel}
                  </div>

                  {Array.from({ length: 24 }).map((_, hour) => {
                    const cell = cellMap.get(`${dayIndex}-${hour}`) ?? {
                      dayOfWeek: dayIndex,
                      hour,
                      count: 0,
                      hourLabel: `${hour < 12 ? hour + "am" : hour === 12 ? "12pm" : hour - 12 + "pm"}`,
                      intensity: 0 as const,
                    };
                    const key = `${dayIndex}-${hour}`;

                    return (
                      <HeatCell
                        key={key}
                        cell={cell}
                        isHovered={hoveredKey === key}
                        isDimmed={hoveredKey !== null && hoveredKey !== key}
                        animDelay={(dayIndex * 24 + hour) * 0.003}
                        onEnter={handleEnter}
                        onLeave={handleLeave}
                        onMouseMove={handleMove}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            <AnimatePresence>
              {tooltip && (
                <CellTooltip
                  state={tooltip}
                  totalInPeriod={data.totalBookingsInPeriod}
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <svg
              className="w-4 h-4 text-muted-foreground/60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
              />
            </svg>
            <span className="hidden sm:inline">
              Hover over blocks for details
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span>Less</span>
            <div className="flex gap-1 items-center">
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  title={INTENSITY_LABELS[level]}
                  className={cn(
                    "w-3.5 h-3.5 rounded-xs",
                    getIntensityColor(level),
                  )}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ServicesStatusBars({ data }: { data: StatusItem[] }) {
  const max = useMemo(() => {
    return Math.max(...data.map((d) => d.count), 1);
  }, [data]);

  return (
    <div className="w-full h-full p-3 border border-border rounded-lg">
      <div className="mb-5">
        <p className="text-sm font-semibold text-foreground">Services Status</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Distribution by status
        </p>
      </div>

      <div className="flex items-end justify-between gap-2 sm:gap-4 h-56">
        {data.map((item, index) => {
          const heightPct = (item.count / max) * 100;

          return (
            <div
              key={item.status}
              className="flex flex-1 flex-col items-center h-full group"
            >
              <div className="text-xs font-semibold text-muted-foreground mb-2 group-hover:text-foreground transition-colors">
                {item.count}
              </div>

              <div className="w-full flex-1 flex items-end justify-center bg-muted/10 hover:bg-muted/25 rounded-t-md overflow-hidden mb-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPct}%` }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 24,
                    delay: index * 0.05,
                  }}
                  className={cn(
                    "w-full max-w-10 rounded-t-md transition-colors",
                    STATUS_COLORS[item.status],
                  )}
                />
              </div>

              <div className="text-xs text-muted-foreground capitalize font-medium">
                {item.status}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
