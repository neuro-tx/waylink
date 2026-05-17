"use client";

import { useState, useTransition } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Flag,
  Milestone,
  CheckCircle2,
  Trash2,
  Pencil,
  ChevronDown,
  Map,
  MoveRight,
  Navigation,
  X,
  AlertTriangle,
} from "lucide-react";
import {
  LocationEntryForm,
  LOCATION_TYPE_CONFIG,
} from "@/app/provider/_components/LocationForm";
import { cn } from "@/lib/utils";
import { LocationValType } from "@/validations";
import { ServiceType } from "@/lib/all-types";
import { locationSlugGenerator } from "@/lib/helpers";
import { useProviderContext } from "@/components/providers/ProviderContext";
import { createLocations } from "@/actions/service.action";
import { useSetupProgress } from "@/components/providers/SetupProgressProvider";
type LocationType = "start" | "end";

function SavedLocationCard({
  location,
  onEdit,
  onDelete,
  isEditing,
}: {
  location: LocationValType;
  onEdit: () => void;
  onDelete: () => void;
  isEditing: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const cfg = LOCATION_TYPE_CONFIG[location.type];
  const genSlug = locationSlugGenerator({
    city: location.city,
    country: location.country,
    type: location.type,
  });

  return (
    <div
      className={cn(
        "rounded-xl border-2 transition-all duration-200 overflow-hidden",
        isEditing
          ? "border-primary bg-primary/5"
          : "border-border bg-card hover:border-border/80",
      )}
    >
      <div
        className="flex items-center gap-3 p-3.5 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
            cfg.bg,
          )}
        >
          <cfg.icon className={cn("h-4 w-4", cfg.color)} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold truncate leading-tight">
              {location.city}
            </p>
            <span className="text-xs text-muted-foreground shrink-0">
              {location.country}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {location.address}
          </p>
        </div>

        <Badge
          variant="outline"
          className={cn(
            "gap-1.5 shrink-0 text-xs font-semibold",
            location.type === "start" &&
              "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
            location.type === "end" &&
              "border-red-500/30 text-red-600 dark:text-red-400 bg-red-500/10",
          )}
        >
          <div className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
          {cfg.label}
        </Badge>

        <div
          className="flex items-center gap-1 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onEdit}
            className={cn(
              "h-7 w-7 rounded-md flex items-center justify-center transition-colors",
              isEditing
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-accent",
            )}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200",
            expanded && "rotate-180",
          )}
        />
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-border/50 px-4 py-4 bg-muted/20 space-y-3">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-muted-foreground mb-1 font-medium">
                Full Address
              </p>
              <p className="text-foreground">{location.address}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1 font-medium">Slug</p>
              <p className="font-mono text-foreground">{genSlug}</p>
            </div>
          </div>
          <Separator className="opacity-40" />
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-muted-foreground mb-1 font-medium">Latitude</p>
              <p className="font-mono text-foreground">{location.latitude}°</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1 font-medium">
                Longitude
              </p>
              <p className="font-mono text-foreground">{location.longitude}°</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RouteVisualiser({ locations }: { locations: LocationValType[] }) {
  const start = locations.find((l) => l.type === "start");
  const end = locations.find((l) => l.type === "end");

  if (!start && !end) return null;

  return (
    <div className="rounded-xl border border-border bg-card/60 px-4 py-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
        <Map className="h-3 w-3" />
        Route Preview
      </p>

      <div className="flex items-center gap-1.5 flex-wrap">
        <div
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium",
            start
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-muted text-muted-foreground/50 border border-dashed border-border",
          )}
        >
          <Flag className="h-3 w-3" />
          <span>{start ? start.city : "Start"}</span>
        </div>

        <MoveRight className="h-3.5 w-3.5 text-muted-foreground/40" />

        <div
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium",
            end
              ? "bg-red-500/10 text-red-600 dark:text-red-400"
              : "bg-muted text-muted-foreground/50 border border-dashed border-border",
          )}
        >
          <MapPin className="h-3 w-3" />
          <span>{end ? end.city : "End"}</span>
        </div>
      </div>
    </div>
  );
}

function EmptyLocations({ ServiceType }: { ServiceType: ServiceType }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-3">
      <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center">
        <Navigation className="h-7 w-7 text-muted-foreground/40" />
      </div>
      <div>
        <p className="font-semibold text-foreground text-sm">
          No locations yet
        </p>
        <p className="text-xs text-muted-foreground mt-1 max-w-55 leading-relaxed">
          {ServiceType === "transport"
            ? "Add a start, end, and any stops along the route"
            : "Add the start and end points for this experience"}
        </p>
      </div>
    </div>
  );
}

function CompletionRow({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <div
        className={cn(
          "h-4 w-4 rounded-full flex items-center justify-center shrink-0",
          done ? "bg-emerald-500" : "bg-muted border-2 border-border",
        )}
      >
        {done && <CheckCircle2 className="h-2.5 w-2.5 text-white" />}
      </div>
      <span className={done ? "text-foreground" : "text-muted-foreground"}>
        {label}
      </span>
    </div>
  );
}

export default function CreateLocationsPage() {
  const router = useRouter();
  const { type } = useProviderContext();
  const params = useParams();

  const serviceId = params.id as string;
  const ServiceType = type as ServiceType;

  const [savedLocations, setSavedLocations] = useState<LocationValType[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { updateProgress } = useSetupProgress();

  function getAvailableTypes(): LocationType[] {
    const hasStart = savedLocations.some((l) => l.type === "start");
    const hasEnd = savedLocations.some((l) => l.type === "end");

    const available: LocationType[] = [];
    if (!hasStart) available.push("start");
    if (!hasEnd) available.push("end");

    if (editingIndex !== null) {
      const editedType = savedLocations[editingIndex]?.type;
      if (editedType && !available.includes(editedType))
        available.unshift(editedType);
    }

    return available;
  }

  const availableTypes = getAvailableTypes();
  const isReadyToSave =
    savedLocations.some((l) => l.type === "start") &&
    savedLocations.some((l) => l.type === "end");

  function handleSave(data: LocationValType) {
    if (editingIndex !== null) {
      setSavedLocations((prev) =>
        prev.map((l, i) => (i === editingIndex ? data : l)),
      );
      setEditingIndex(null);
    } else {
      setSavedLocations((prev) => [...prev, data]);
    }
  }

  function handleEdit(index: number) {
    setEditingIndex((prev) => (prev === index ? null : index));
  }

  function handleDelete(index: number) {
    setSavedLocations((prev) => prev.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
    else if (editingIndex !== null && editingIndex > index) {
      setEditingIndex((p) => (p !== null ? p - 1 : null));
    }
  }

  function handleFinish() {
    if (!isReadyToSave) return;
    setError(null);
    startTransition(async () => {
      const res = await createLocations(serviceId, savedLocations);
      if (!res.success) {
        setError(res.error);
        return;
      }

      updateProgress({
        hasLocation: true,
      });
      router.push(`/provider/services/create/${serviceId}/details`);
    });
  }

  const editingData =
    editingIndex !== null ? savedLocations[editingIndex] : null;

  const sortedLocations = [
    ...savedLocations.filter((l) => l.type === "start"),
    ...savedLocations.filter((l) => l.type === "end"),
  ];

  const hasStart = savedLocations.some((l) => l.type === "start");
  const hasEnd = savedLocations.some((l) => l.type === "end");

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-4 md:px-6 py-8">
        {/* Hero */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-foreground tracking-tight">
              {ServiceType === "transport"
                ? "Map the route"
                : "Set the locations"}
            </h2>
            <p className="mt-1.5 text-muted-foreground">
              {ServiceType === "transport"
                ? "Add a start point, any stops along the way, and an end destination."
                : "Add where this experience starts and ends."}
            </p>
          </div>

          <div className="hidden lg:flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground">Service ID</p>
              <p className="text-xs font-mono text-foreground">{serviceId}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="relative my-4 overflow-hidden rounded-xl border transition-all duration-300">
            <div className="absolute left-0 top-0 h-full w-1 bg-red-500" />

            <div className="relative flex items-start gap-4 py-3 px-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 text-red-500 transition-transform duration-300">
                <AlertTriangle className="size-5" />
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium tracking-tight">
                    Something went wrong
                  </p>
                </div>

                <p className="text-sm leading-relaxed text-red-500">{error}</p>
              </div>

              <button
                type="button"
                onClick={() => setError(null)}
                title="Hide"
                className="flex size-8 items-center justify-center rounded-full transition-all duration-200 hover:bg-red-500/5 dark:hover:bg-red-500/20 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Two-column grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* ── Left: Entry form (sticky) ── */}
          <div className="lg:sticky lg:top-18">
            <div className="mb-4 flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="h-3.5 w-3.5 text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                {editingIndex !== null ? "Edit Location" : "New Location"}
              </p>
              {availableTypes.length === 0 && editingIndex === null && (
                <Badge
                  variant="outline"
                  className="ml-auto text-xs text-muted-foreground"
                >
                  All required added
                </Badge>
              )}
            </div>

            {availableTypes.length === 0 && editingIndex === null ? (
              // All required locations present (experience: start + end done)
              <div className="rounded-xl border-2 border-dashed border-border bg-card/40 flex flex-col items-center justify-center py-12 px-6 text-center gap-3">
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    All locations set
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-50 leading-relaxed">
                    {ServiceType === "transport"
                      ? "You can still add more stops if needed"
                      : "Start and end locations are both set"}
                  </p>
                </div>
                {ServiceType === "transport" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      // force a "stop" type entry
                      setSavedLocations((prev) => prev);
                    }}
                  >
                    <Milestone className="h-3.5 w-3.5" />
                    Add another stop
                  </Button>
                )}
              </div>
            ) : (
              <LocationEntryForm
                key={editingIndex ?? `new-${availableTypes[0]}`}
                ServiceType={type}
                availableTypes={availableTypes}
                editingData={editingData}
                editingIndex={editingIndex}
                onSave={handleSave}
                onCancelEdit={() => setEditingIndex(null)}
              />
            )}
          </div>

          {/* ── Right: Saved list ── */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-muted flex items-center justify-center">
                  <Map className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold text-foreground">Route</p>
              </div>
              {savedLocations.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {savedLocations.length} location
                  {savedLocations.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>

            {/* Route visualiser */}
            {savedLocations.length > 0 && (
              <div className="mb-3">
                <RouteVisualiser locations={savedLocations} />
              </div>
            )}

            {/* Location cards */}
            <div className="space-y-2.5">
              {sortedLocations.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-border bg-card/40">
                  <EmptyLocations ServiceType={ServiceType} />
                </div>
              ) : (
                sortedLocations.map((loc, i) => {
                  const realIndex = savedLocations.indexOf(loc);
                  return (
                    <SavedLocationCard
                      key={realIndex}
                      location={loc}
                      onEdit={() => handleEdit(realIndex)}
                      onDelete={() => handleDelete(realIndex)}
                      isEditing={editingIndex === realIndex}
                    />
                  );
                })
              )}
            </div>

            {/* Save footer */}
            <div className="mt-6 rounded-xl border border-border bg-card p-4 space-y-3">
              {/* Checklist */}
              <div className="space-y-1.5">
                <CompletionRow done={hasStart} label="Start location" />
                <CompletionRow done={hasEnd} label="End location" />
              </div>

              <Separator className="opacity-40" />

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() =>
                    router.push(
                      `/provider/services/create/${serviceId}/details`,
                    )
                  }
                >
                  Skip for now
                </Button>
                <Button
                  type="button"
                  onClick={handleFinish}
                  disabled={isPending || !isReadyToSave}
                  className="flex-1 gap-2"
                  size="lg"
                >
                  {isPending ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Save & Finish
                    </>
                  )}
                </Button>
              </div>

              {!isReadyToSave && (
                <p className="text-xs text-muted-foreground text-center">
                  Add both a start and end location to finish
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
