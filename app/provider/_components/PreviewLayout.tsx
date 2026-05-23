"use client";

import { useState } from "react";
import { Experience, ServiceMedia, Transport } from "@/lib/panel-types";
import { cn } from "@/lib/utils";
import { DifficultyLevel, SetupProgress } from "@/lib/all-types";
import {
  FileText,
  Image,
  GitBranch,
  Tag,
  Star,
  MapPin,
  Check,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  Users,
  Info,
  Bus,
  Sparkles,
  Route,
  X,
  Clock3,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

const STEPS: {
  key: keyof Omit<SetupProgress, "productId" | "createdAt" | "updatedAt">;
  label: string;
  icon: React.ElementType;
}[] = [
  { key: "mainInfo", label: "Main information", icon: FileText },
  { key: "hasMedia", label: "Photos & media", icon: Image },
  { key: "hasVariants", label: "Variants", icon: GitBranch },
  { key: "hasMetadata", label: "Metadata", icon: Tag },
  { key: "hasScore", label: "Score", icon: Star },
  { key: "hasLocation", label: "Location", icon: MapPin },
];

export const DIFFICULTY_CONFIG: Record<
  DifficultyLevel,
  { label: string; color: string }
> = {
  easy: { label: "Easy", color: "text-emerald-600" },
  moderate: { label: "Moderate", color: "text-amber-600" },
  challenging: { label: "Challenging", color: "text-orange-600" },
  extreme: { label: "Extreme", color: "text-red-600" },
};

function formatDuration(count: number, unit: string) {
  return `${count} ${count === 1 ? unit.replace(/s$/, "") : unit}`;
}

export function MediaGallery({ media }: { media: ServiceMedia[] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const sorted = [...media].sort((a, b) => a.displayOrder - b.displayOrder);
  const active = sorted[activeIdx];

  if (!sorted.length)
    return (
      <div className="aspect-video bg-muted rounded-2xl flex items-center justify-center text-muted-foreground text-sm">
        No media available
      </div>
    );

  return (
    <div className="space-y-2">
      {/* Main image */}
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted group">
        <img
          src={active.url}
          alt="Service media"
          className="w-full h-full object-cover transition-all duration-500"
        />
        {active.isCover && (
          <span className="absolute top-3 left-3 text-[11px] font-medium bg-black/60 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
            Cover photo
          </span>
        )}
        {sorted.length > 1 && (
          <>
            <button
              onClick={() =>
                setActiveIdx((i) => (i - 1 + sorted.length) % sorted.length)
              }
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveIdx((i) => (i + 1) % sorted.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
        <div className="absolute bottom-3 right-3 text-[11px] bg-black/50 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
          {activeIdx + 1} / {sorted.length}
        </div>
      </div>

      {/* Thumbnails */}
      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-hidden flex-wrap pb-1">
          {sorted.map((m, i) => (
            <button
              key={m.id}
              onClick={() => setActiveIdx(i)}
              className={cn(
                "shrink-0 size-16 rounded-lg overflow-hidden border-2 transition-all",
                i === activeIdx
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-transparent opacity-60 hover:opacity-100",
              )}
            >
              <img src={m.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function SetupProgressCard({ setup }: { setup: SetupProgress }) {
  type StepKey = (typeof STEPS)[number]["key"];
  const completed = STEPS.filter(({ key }) => setup[key as StepKey]).length;

  const total = STEPS.length;
  const pct = Math.round((completed / total) * 100);
  const isComplete = completed === total;

  return (
    <div
      className={cn(
        "rounded-xl border p-4 space-y-4 transition-colors",
        isComplete
          ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30"
          : "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div
            className={cn(
              "mt-0.5 shrink-0",
              isComplete
                ? "text-emerald-500"
                : "text-amber-600 dark:text-amber-400",
            )}
          >
            {isComplete ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
          </div>

          <div className="space-y-0.5">
            <p
              className={cn(
                "text-sm font-medium",
                isComplete
                  ? "text-emerald-700 dark:text-emerald-300"
                  : "text-amber-800 dark:text-amber-300",
              )}
            >
              {isComplete ? "Setup complete" : "Setup incomplete"}
            </p>

            <p
              className={cn(
                "text-xs",
                isComplete
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-amber-700 dark:text-amber-400",
              )}
            >
              {isComplete
                ? "Your service is ready to publish"
                : `Complete all steps to publish your service`}
            </p>
          </div>
        </div>

        <span
          className={cn(
            "text-sm font-semibold tabular-nums",
            isComplete
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-amber-700 dark:text-amber-300",
          )}
        >
          {pct}%
        </span>
      </div>

      {!setup.hasScore && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 dark:border-blue-900 dark:bg-blue-950/40">
          <div className="flex items-start gap-2">
            <Clock3 className="w-4 h-4 mt-0.5 text-blue-600 dark:text-blue-400 shrink-0" />

            <div className="space-y-0.5">
              <p className="text-xs font-medium text-blue-800 dark:text-blue-300">
                Score calculation in progress
              </p>

              <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                This calculation process may take some time. Once completed, we
                will notify you automatically.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="space-y-1.5">
        <div
          className={cn(
            "flex items-center justify-between text-xs",
            isComplete
              ? "text-emerald-700 dark:text-emerald-400"
              : "text-amber-700 dark:text-amber-400",
          )}
        >
          <span>
            {completed} of {total} steps complete
          </span>
        </div>

        <div
          className={cn(
            "h-1.5 rounded-full overflow-hidden",
            isComplete
              ? "bg-emerald-200 dark:bg-emerald-900"
              : "bg-amber-200 dark:bg-amber-900",
          )}
        >
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              isComplete ? "bg-emerald-500" : "bg-amber-500",
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {STEPS.map(({ key, label, icon: Icon }) => {
          const done = setup[key];

          return (
            <div key={key} className="flex items-center gap-2">
              <div
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors",
                  done
                    ? isComplete
                      ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400"
                      : "bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400"
                    : "bg-muted text-muted-foreground/50",
                )}
              >
                {done ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Icon className="w-3 h-3" />
                )}
              </div>

              <span
                className={cn(
                  "text-xs truncate",
                  done ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ExperienceDetails({ experience }: { experience?: Experience }) {
  if (!experience) return null;

  const diff = experience.difficultyLevel
    ? DIFFICULTY_CONFIG[experience.difficultyLevel]
    : null;

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium uppercase tracking-wide">
              Duration
            </span>
          </div>
          <p className="text-sm font-semibold text-foreground">
            {formatDuration(experience.durationCount, experience.durationUnit)}
          </p>
        </div>

        {diff && (
          <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Zap className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium uppercase tracking-wide">
                Difficulty
              </span>
            </div>
            <p className={cn("text-sm font-semibold", diff.color)}>
              {diff.label}
            </p>
          </div>
        )}

        {experience.ageRestriction && (
          <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium uppercase tracking-wide">
                Min age
              </span>
            </div>
            <p className="text-sm font-semibold text-foreground">
              {experience.ageRestriction}
            </p>
          </div>
        )}
      </div>

      {/* Included */}
      {experience.included && experience.included.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <h4 className="text-sm font-medium">What's included</h4>
          </div>
          <ul className="space-y-1.5">
            {experience.included.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <div className="mt-1 w-3.5 h-3.5 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center shrink-0">
                  <Check className="w-2 h-2 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-sm text-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Not included */}
      {experience.notIncluded && experience.notIncluded.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <X className="w-3.5 h-3.5 text-muted-foreground" />
            <h4 className="text-sm font-medium">Not included</h4>
          </div>
          <ul className="space-y-1.5">
            {experience.notIncluded.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <div className="mt-1 w-3.5 h-3.5 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <X className="w-2 h-2 text-muted-foreground" />
                </div>
                <span className="text-sm text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Requirements */}
      {experience.requirements && experience.requirements.length > 0 && (
        <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-muted-foreground" />
            <h4 className="text-sm font-medium">Requirements</h4>
          </div>
          <ul className="space-y-1">
            {experience.requirements.map((req) => (
              <li
                key={req}
                className="text-sm text-muted-foreground flex items-start gap-2"
              >
                <span className="mt-1.5 w-1 h-1 rounded-full bg-muted-foreground/50 shrink-0" />
                {req}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function TransportDetails({ transport }: { transport?: Transport }) {
  if (!transport) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Bus className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium uppercase tracking-wide">
              Type
            </span>
          </div>
          <p className="text-sm font-semibold capitalize">
            {transport.transportType}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium uppercase tracking-wide">
              Class
            </span>
          </div>
          <p className="text-sm font-semibold capitalize">{transport.class}</p>
        </div>

        <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Route className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium uppercase tracking-wide">
              Route
            </span>
          </div>
          <p className="text-sm font-semibold">
            {transport.directroute ? "Direct" : "With stops"}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Star className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium uppercase tracking-wide">
              Score
            </span>
          </div>
          <p className="text-sm font-semibold">{transport.score.toFixed(1)}</p>
        </div>
      </div>

      {transport.description && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          {transport.description}
        </p>
      )}
    </div>
  );
}

export function PreviewSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
          <div className="space-y-7">
            {/* Media */}
            <div className="space-y-2">
              <Skeleton className="w-full aspect-video rounded-2xl" />
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="w-16 h-16 rounded-lg shrink-0" />
                ))}
              </div>
            </div>

            {/* Title & meta */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-4 w-36" />
              </div>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>

            {/* About */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>

            <Separator />

            {/* Details section */}
            <div className="space-y-4">
              <Skeleton className="h-4 w-36" />

              {/* Stat cards */}
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border bg-muted/30 px-4 py-3 space-y-2"
                  >
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </div>

              {/* Included */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <Skeleton className="w-3.5 h-3.5 rounded-full shrink-0" />
                      <Skeleton
                        className="h-3.5"
                        style={{ width: `${55 + (i % 3) * 15}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Not included */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <Skeleton className="w-3.5 h-3.5 rounded-full shrink-0" />
                      <Skeleton
                        className="h-3.5"
                        style={{ width: `${45 + (i % 3) * 20}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
                <Skeleton className="h-4 w-24" />
                <div className="space-y-1.5">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton
                      key={i}
                      className="h-3.5"
                      style={{ width: `${60 + i * 15}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="lg:sticky lg:top-20 space-y-4">
            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="px-5 py-5 border-b border-border space-y-2">
                <Skeleton className="h-3 w-24" />
                <div className="flex items-baseline gap-2">
                  <Skeleton className="h-9 w-28" />
                  <Skeleton className="h-4 w-14" />
                </div>
                <Skeleton className="h-3 w-10" />
              </div>

              {/* Stats */}
              <div className="px-5 py-4 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-3.5 h-3.5 rounded-sm" />
                      <Skeleton className="h-3.5 w-20" />
                    </div>
                    <Skeleton className="h-3.5 w-16" />
                  </div>
                ))}
              </div>

              {/* Buttons */}
              <div className="px-5 pb-5 space-y-2.5">
                <Skeleton className="h-9 w-full rounded-md" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            </div>

            {/* Meta card */}
            <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 space-y-2.5">
              <Skeleton className="h-3 w-20" />
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
