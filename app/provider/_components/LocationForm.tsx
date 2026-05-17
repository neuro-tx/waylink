"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Flag,
  Navigation,
  Plus,
  CheckCircle2,
  Pencil,
  X,
  Globe,
  Hash,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { locationValidator, LocationValType } from "@/validations";
import { ServiceType } from "@/lib/all-types";

type LocationType = "start" | "end";

export const LOCATION_TYPE_CONFIG = {
  start: {
    label: "Start",
    icon: Flag,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500",
    activeBg: "bg-emerald-500/15 border-emerald-500",
    dot: "bg-emerald-500",
    description: "Where the journey begins",
  },
  end: {
    label: "End",
    icon: MapPin,
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500",
    activeBg: "bg-red-500/15 border-red-500",
    dot: "bg-red-500",
    description: "Where the journey ends",
  }
} as const;

interface LocationEntryFormProps {
  ServiceType: ServiceType;
  availableTypes: LocationType[];
  editingData: LocationValType | null;
  editingIndex: number | null;
  onSave: (data: LocationValType) => void;
  onCancelEdit: () => void;
}

export function LocationEntryForm({
  ServiceType,
  availableTypes,
  editingData,
  editingIndex,
  onSave,
  onCancelEdit,
}: LocationEntryFormProps) {
  const isEditing = editingIndex !== null;
  const defaultType = editingData?.type ?? availableTypes[0] ?? "start";

  const form = useForm({
    resolver: zodResolver(locationValidator),
    defaultValues: editingData ?? {
      city: "",
      address: "",
      country: "",
      latitude: "",
      longitude: "",
    },
  });

  const selectedType = form.watch("type") ?? defaultType;
  const typeCfg = LOCATION_TYPE_CONFIG[selectedType];

  function handleSubmit(data: LocationValType) {
    onSave(data);
    if (!isEditing) {
      form.reset({
        city: "",
        type: "start",
        address: "",
        country: "",
        latitude: "",
        longitude: "",
      });
    }
  }

  const allTypes: LocationType[] = ["start", "end"];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
        {/* Edit mode banner */}
        {isEditing && (
          <div
            className={cn(
              "flex items-center justify-between rounded-md border px-4 py-2.5",
              typeCfg.bg,
              typeCfg.border,
            )}
          >
            <div
              className={cn(
                "flex items-center gap-2 text-sm text-primary font-medium",
                typeCfg.color,
              )}
            >
              <Pencil className="h-3.5 w-3.5" />
              Editing location {editingIndex + 1}
            </div>
            <button
              type="button"
              onClick={onCancelEdit}
              className="text-muted-foreground hover:text-foreground bg-transparent"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ── Location type selector ── */}
        <div className="rounded-xl border-2 border-primary/30 bg-card overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-muted/30">
            <div className="rounded-lg p-1.5 bg-primary/10">
              <Navigation className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-sm font-semibold">Location Type</span>
          </div>
          <div className="p-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <div
                    className={cn(
                      "grid gap-2",
                      ServiceType === "transport"
                        ? "grid-cols-3"
                        : "grid-cols-2",
                    )}
                  >
                    {allTypes.map((locType) => {
                      const cfg = LOCATION_TYPE_CONFIG[locType];
                      const isActive = field.value === locType;

                      const isDisabled =
                        !availableTypes.includes(locType) && !isEditing;

                      return (
                        <button
                          key={locType}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => !isDisabled && field.onChange(locType)}
                          className={cn(
                            "flex flex-col items-start gap-2 rounded-xl border-2 p-3.5 text-left transition-all duration-200",
                            isActive && cfg.activeBg,
                            !isActive &&
                              !isDisabled &&
                              "border-border bg-background hover:bg-accent/30",
                            isDisabled &&
                              "border-border/30 bg-muted/30 opacity-40 cursor-not-allowed",
                          )}
                        >
                          <div
                            className={cn(
                              "rounded-lg p-2",
                              isActive ? cfg.bg : "bg-muted",
                            )}
                          >
                            <cfg.icon
                              className={cn(
                                "h-4 w-4",
                                isActive ? cfg.color : "text-muted-foreground",
                              )}
                            />
                          </div>
                          <div>
                            <p className="text-xs font-bold">{cfg.label}</p>
                            <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                              {cfg.description}
                            </p>
                          </div>
                          {isDisabled && (
                            <Badge
                              variant="outline"
                              className="text-[9px] px-1.5 py-0"
                            >
                              added
                            </Badge>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* ── City & Country ── */}
        <div className="rounded-xl border-2 border-primary/30 bg-card overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-muted/30">
            <div className={cn("rounded-lg p-1.5", typeCfg.bg)}>
              <typeCfg.icon className={cn("h-3.5 w-3.5", typeCfg.color)} />
            </div>
            <span className="text-sm font-semibold">Place</span>
          </div>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">
                      City <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. Cairo"
                        className="h-10 text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      Country <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. Egypt"
                        className="h-10 text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">
                    Full Address <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. 123 Tahrir Square, Cairo"
                      className="h-10 text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* ── Coordinates ── */}
        <div className="rounded-xl border-2 border-primary/30 bg-card overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-muted/30">
            <div className="rounded-lg p-1.5 bg-primary/10">
              <Hash className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-sm font-semibold">Coordinates</span>
            <Badge variant="outline" className="text-[9px] ml-auto">
              GPS decimal
            </Badge>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">
                      Latitude <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="any"
                        placeholder="30.0444"
                        className="h-10 text-sm font-mono"
                      />
                    </FormControl>
                    <p className="text-[10px] text-muted-foreground">
                      −90 to 90
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">
                      Longitude <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="any"
                        placeholder="31.2357"
                        className="h-10 text-sm font-mono"
                      />
                    </FormControl>
                    <p className="text-[10px] text-muted-foreground">
                      −180 to 180
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* ── Submit ── */}
        <Button type="submit" size="lg" className="w-full">
          {isEditing ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Update Location
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Add Location
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
