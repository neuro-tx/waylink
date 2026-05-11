"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
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
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  Plus,
  Trash2,
  CheckCircle2,
  X,
  Pencil,
  LayoutList,
} from "lucide-react";
import {
  cn,
  calculateDurationInMinutes,
  formatDuration,
  formatTo12Hour,
} from "@/lib/utils";
import { TransportForm, transportSchema } from "@/validations";
import { DynamicCollectionPanel, Section, TagListField } from "./ServiceUtils";

const styles: Record<
  "indigo" | "amber",
  {
    active: string;
    inactive: string;
    ring: string;
  }
> = {
  indigo: {
    active:
      "border-indigo-500/30 bg-indigo-500 text-white shadow-indigo-500/25",
    inactive:
      "border-indigo-200/60 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/[0.06] hover:border-indigo-300/60 dark:hover:border-indigo-700/50",
    ring: "focus-visible:ring-indigo-400/40",
  },

  amber: {
    active: "border-amber-500/30 bg-amber-500 text-white shadow-amber-500/25",
    inactive:
      "border-amber-200/60 dark:border-amber-900/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/[0.06] hover:border-amber-300/60 dark:hover:border-amber-700/50",
    ring: "focus-visible:ring-amber-400/40",
  },
};

const TRANSPORT_TYPES = [
  { value: "bus", label: "Bus" },
  { value: "flight", label: "Flight" },
  { value: "train", label: "Train" },
  { value: "ferry", label: "Ferry" },
  { value: "cruise", label: "Cruise" },
  { value: "car_rental", label: "Car Rental" },
  { value: "shuttle", label: "Shuttle" },
  { value: "taxi", label: "Taxi" },
  { value: "private_van", label: "Private Van" },
  { value: "helicopter", label: "Helicopter" },
] as const;

const TRANSPORT_CLASSES = [
  { value: "economy", label: "Economy" },
  { value: "premium_economy", label: "Premium Economy" },
  { value: "business", label: "Business" },
  { value: "first_class", label: "First Class" },
  { value: "vip", label: "VIP" },
] as const;

const SEAT_TYPES = [
  { value: "standard", label: "Standard" },
  { value: "reclining", label: "Reclining" },
  { value: "semi_sleeper", label: "Semi Sleeper" },
  { value: "sleeper", label: "Sleeper" },
  { value: "bed", label: "Bed" },
  { value: "cabin", label: "Cabin" },
  { value: "premium", label: "Premium" },
  { value: "vip", label: "VIP" },
  { value: "window", label: "Window" },
  { value: "aisle", label: "Aisle" },
] as const;

const AMENITY_OPTIONS = [
  "Wi-Fi",
  "A/C",
  "Meals",
  "Entertainment",
  "Power Outlets",
  "Luggage Rack",
  "Blanket & Pillow",
  "USB Charging",
  "Toilet",
  "Bar",
] as const;

function PillSelector({
  value,
  options,
  onChange,
  cols = 5,
  theme = "indigo",
}: {
  value: string | undefined;
  options: readonly { value: string; label: string }[];
  onChange: (v: string | undefined) => void;
  cols?: number;
  theme?: "indigo" | "amber";
}) {
  const st = styles[theme];

  return (
    <div
      className={cn(
        "grid gap-2",
        cols === 2 && "grid-cols-2",
        cols === 3 && "grid-cols-3",
        cols === 4 && "grid-cols-4",
        cols === 5 && "grid-cols-5",
      )}
    >
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(isActive ? undefined : opt.value)}
            className={cn(
              "rounded-lg border-2 px-3 py-2.5 text-xs font-semibold text-center transition-all duration-150",
              isActive ? st.active : st.inactive,
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function StopRow({
  scheduleIdx,
  stopIdx,
  control,
  remove,
}: {
  scheduleIdx: number;
  stopIdx: number;
  control: any;
  remove: () => void;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto_auto_28px] gap-1 items-end rounded-md border border-border/60 bg-muted/30 p-2.5">
      <FormField
        control={control}
        name={`schedules.${scheduleIdx}.stops.${stopIdx}.locationName`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Stop
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="City / station"
                className="h-8 text-xs"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`schedules.${scheduleIdx}.stops.${stopIdx}.arrivalTime`}
        render={({ field }) => (
          <FormItem className="w-28">
            <FormLabel className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Arrives
            </FormLabel>
            <FormControl>
              <Input {...field} type="time" className="h-8 text-xs" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`schedules.${scheduleIdx}.stops.${stopIdx}.departureTime`}
        render={({ field }) => (
          <FormItem className="w-28">
            <FormLabel className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Departs
            </FormLabel>
            <FormControl>
              <Input {...field} type="time" className="h-8 text-xs" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <button
        type="button"
        onClick={remove}
        className="h-8 w-7 self-end flex items-center justify-center rounded-md text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

function ScheduleSlice({
  index,
  control,
  remove,
  isEditing,
  onEdit,
  hasDirect,
  setValue,
}: {
  index: number;
  control: any;
  remove: () => void;
  isEditing: boolean;
  onEdit: () => void;
  hasDirect: boolean;
  setValue: any;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isEditing) setOpen(true);
  }, [isEditing]);

  const label = useWatch({ control, name: `schedules.${index}.label` });
  const depDate = useWatch({
    control,
    name: `schedules.${index}.departureDate`,
  });
  const arrDate = useWatch({ control, name: `schedules.${index}.arrivalDate` });
  const duration = useWatch({ control, name: `schedules.${index}.duration` });
  const checkIn = useWatch({ control, name: `schedules.${index}.checkInTime` });
  const stops = useWatch({ control, name: `schedules.${index}.stops` }) as
    | any[]
    | undefined;

  const {
    fields: stopFields,
    append: appendStop,
    remove: removeStop,
  } = useFieldArray({
    control,
    name: `schedules.${index}.stops`,
  });

  useEffect(() => {
    const mins = calculateDurationInMinutes(
      new Date(depDate),
      new Date(arrDate),
    );

    setValue(`schedules.${index}.duration`, mins !== null ? String(mins) : "", {
      shouldDirty: false,
    });
  }, [depDate, arrDate, index, control]);

  const displayTitle = label || `Schedule ${index + 1}`;
  const durationMins = duration ? Number(duration) : null;
  const formattedDur =
    durationMins && durationMins > 0 ? formatDuration(durationMins) : null;
  const formatDT = (val: string) =>
    val
      ? new Date(val).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })
      : "—";

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div
        className={cn(
          "rounded-xl border-2 overflow-hidden transition-all duration-200",
          isEditing
            ? "border-indigo-500 bg-indigo-500/5"
            : "border-border bg-card hover:border-indigo-400/40",
        )}
      >
        <div
          className={cn(
            "flex items-center gap-3 px-4 py-3",
            isEditing && "bg-indigo-500/5",
          )}
        >
          <div
            className={cn(
              "h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-colors",
              isEditing
                ? "bg-indigo-500 text-white"
                : "bg-muted text-muted-foreground",
            )}
          >
            {index + 1}
          </div>

          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => setOpen((v) => !v)}
          >
            <p className="text-sm font-semibold leading-tight truncate">
              {displayTitle}
            </p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {depDate && arrDate && (
                <span className="text-[10px] text-muted-foreground font-mono">
                  {formatDT(depDate)} → {formatDT(arrDate)}
                </span>
              )}
              {formattedDur && (
                <Badge
                  variant="outline"
                  className="text-[9px] px-1.5 border-indigo-500/20 text-indigo-500"
                >
                  {formattedDur}
                </Badge>
              )}
              {!hasDirect && stops && stops.length > 0 && (
                <span className="text-[10px] text-muted-foreground">
                  · {stops.length} stop{stops.length > 1 ? "s" : ""}
                </span>
              )}
              {checkIn && (
                <span className="text-[10px] text-muted-foreground">
                  · Check-in {formatTo12Hour(checkIn)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={onEdit}
              className={cn(
                "h-7 w-7 rounded-md flex items-center justify-center transition-colors",
                isEditing
                  ? "bg-indigo-500/20 text-indigo-500"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
              )}
              title="Edit"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={remove}
              className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              title="Remove"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  open && "rotate-180",
                )}
              />
            </button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <div className="border-t border-border/50 px-4 py-4 space-y-4 bg-muted/10">
            {/* Label */}
            <FormField
              control={control}
              name={`schedules.${index}.label`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Schedule Label{" "}
                    <span className="normal-case font-normal">(optional)</span>
                  </FormLabel>
                  {isEditing ? (
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. Morning Departure · Flight EK204"
                        className="h-9 text-sm"
                      />
                    </FormControl>
                  ) : (
                    <p className="text-sm text-foreground">
                      {field.value || (
                        <span className="italic text-muted-foreground/50">
                          —
                        </span>
                      )}
                    </p>
                  )}
                </FormItem>
              )}
            />

            <Separator className="opacity-30" />

            {/* Departure + Arrival — datetime-local side by side */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 items-start">
              <FormField
                control={control}
                name={`schedules.${index}.departureDate`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">
                      Departure <span className="text-destructive">*</span>
                    </FormLabel>
                    {isEditing ? (
                      <FormControl>
                        <Input
                          {...field}
                          type="datetime-local"
                          className="h-9 text-sm"
                        />
                      </FormControl>
                    ) : (
                      <p className="text-sm font-mono text-foreground">
                        {formatDT(field.value)}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`schedules.${index}.arrivalDate`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">
                      Arrival <span className="text-destructive">*</span>
                    </FormLabel>
                    {isEditing ? (
                      <FormControl>
                        <Input
                          {...field}
                          type="datetime-local"
                          className="h-9 text-sm"
                        />
                      </FormControl>
                    ) : (
                      <p className="text-sm font-mono text-foreground">
                        {formatDT(field.value)}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Duration (auto-calculated, read-only) + Check-in */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-3">
                <p className="text-xs font-medium leading-none text-foreground">
                  Duration
                </p>
                <div
                  className={cn(
                    "h-9 flex items-center px-3 rounded-md border text-sm font-mono",
                    formattedDur
                      ? "border-indigo-500/20 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 font-semibold"
                      : "border-border bg-muted/40 text-muted-foreground/50 italic",
                  )}
                >
                  {formattedDur ?? "auto-calculated"}
                  {durationMins && durationMins > 0 && (
                    <span className="ml-1.5 text-xs text-muted-foreground font-normal">
                      ({durationMins} min)
                    </span>
                  )}
                </div>
              </div>

              <FormField
                control={control}
                name={`schedules.${index}.checkInTime`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">
                      Check-in Time{" "}
                      <span className="text-muted-foreground font-normal">
                        (opt.)
                      </span>
                    </FormLabel>
                    {isEditing ? (
                      <FormControl>
                        <Input {...field} type="time" className="h-9 text-sm" />
                      </FormControl>
                    ) : (
                      <p className="text-sm font-mono text-foreground">
                        {field.value || "—"}
                      </p>
                    )}
                  </FormItem>
                )}
              />
            </div>

            {/* Stops */}
            {!hasDirect && (
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">
                  Intermediate Stops
                </p>
                {stopFields.map((sf, si) => (
                  <StopRow
                    key={sf.id}
                    scheduleIdx={index}
                    stopIdx={si}
                    control={control}
                    remove={() => removeStop(si)}
                  />
                ))}
                {isEditing && (
                  <button
                    type="button"
                    onClick={() =>
                      appendStop({
                        locationName: "",
                        arrivalTime: "",
                        departureTime: "",
                      })
                    }
                    className="w-full rounded-lg border border-dashed border-indigo-500/30 hover:border-indigo-500/60 hover:bg-indigo-500/5 transition-all py-2.5 flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-indigo-500"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add stop
                  </button>
                )}
              </div>
            )}

            {/* Done */}
            {isEditing && (
              <Button
                type="button"
                variant="outline"
                onClick={onEdit}
                className="w-full gap-2 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Done
                editing
              </Button>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

interface TransportDetailsProps {
  productId: string;
  onFinish: (data: TransportForm) => void;
  isSubmitting?: boolean;
}

export function TransportDetailsPage({
  productId,
  onFinish,
  isSubmitting = false,
}: TransportDetailsProps) {
  const form = useForm({
    resolver: zodResolver(transportSchema),
    defaultValues: {
      hasDirectRoute: true,
      amenities: [],
      importantNotes: [],
      schedules: [],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "schedules",
  });

  const hasDirect =
    useWatch({ control: form.control, name: "hasDirectRoute" }) ?? false;

  return (
    <div className="w-full px-4 md:px-6 py-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            Transport details
          </h2>
          <p className="mt-1.5 text-muted-foreground">
            Configure the vehicle, class, and policies on the left. Add
            per-variant schedules on the right.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-3 py-2 shrink-0">
          <div className="h-2 w-2 rounded-full bg-indigo-500" />
          <div>
            <p className="text-[10px] text-muted-foreground">Transport</p>
            <p className="text-xs font-mono text-foreground truncate max-w-35">
              {productId}
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onFinish)}>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-[1fr_600px] gap-8 items-start">
            <div className="space-y-2">
              <div className="rounded-xl border-2 border-indigo-500/30 bg-card overflow-hidden">
                <div className="px-5 py-4 border-b border-border/50">
                  <p className="text-sm font-semibold">
                    Vehicle Type{" "}
                    <span className="text-destructive ml-1">*</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Select the mode of transport
                  </p>
                </div>
                <div className="px-5 py-4">
                  <FormField
                    control={form.control}
                    name="transportType"
                    render={({ field }) => (
                      <FormItem>
                        <div className="grid grid-cols-5 gap-2">
                          {TRANSPORT_TYPES.map(({ value, label }) => {
                            const isActive = field.value === value;
                            return (
                              <button
                                key={value}
                                type="button"
                                onClick={() => field.onChange(value)}
                                className={cn(
                                  "rounded-lg border-2 px-2 py-2.5 text-xs font-semibold text-center transition-all duration-150",
                                  isActive
                                    ? "border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                                    : "border-border bg-background text-foreground hover:border-indigo-400/40 hover:bg-indigo-500/5",
                                )}
                              >
                                {label}
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

              {/* ── Route & addresses ── */}
              <Section
                label="Route"
                sublabel="Distance, type and terminal addresses"
                theme="indigo"
              >
                <div className="grid grid-cols-2 gap-3 items-start">
                  <FormField
                    control={form.control}
                    name="distance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Distance (km)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            placeholder="e.g. 450"
                            className="h-9 text-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Direct route toggle */}
                  <FormField
                    control={form.control}
                    name="hasDirectRoute"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Route Type</FormLabel>
                        <div className="grid grid-cols-2 gap-2 h-9">
                          {[
                            { val: true, lbl: "Direct" },
                            { val: false, lbl: "With Stops" },
                          ].map(({ val, lbl }) => (
                            <button
                              key={String(val)}
                              type="button"
                              onClick={() => field.onChange(val)}
                              className={cn(
                                "rounded-lg border-2 text-xs font-semibold h-full transition-all",
                                field.value === val
                                  ? "border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                                  : "border-border bg-background hover:border-indigo-400/40 hover:bg-indigo-500/5",
                              )}
                            >
                              {lbl}
                            </button>
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="departureAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">
                          Departure Terminal
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Station / terminal name"
                            className="h-9 text-sm"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="arrivalAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">
                          Arrival Terminal
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Station / terminal name"
                            className="h-9 text-sm"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </Section>

              {/* ── Class & Seat ── */}
              <Section
                label="Class & Seat"
                sublabel="Travel class and seating preference"
                theme="indigo"
              >
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
                      Travel Class
                    </p>
                    <FormField
                      control={form.control}
                      name="transportClass"
                      render={({ field }) => (
                        <FormItem>
                          <PillSelector
                            value={field.value}
                            options={TRANSPORT_CLASSES}
                            onChange={field.onChange}
                            cols={5}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Separator className="opacity-40" />
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
                      Seat Type
                    </p>
                    <FormField
                      control={form.control}
                      name="seatType"
                      render={({ field }) => (
                        <FormItem>
                          <PillSelector
                            value={field.value}
                            options={SEAT_TYPES}
                            onChange={field.onChange}
                            cols={5}
                            theme="amber"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </Section>

              {/* ── Amenities ── */}
              <Section
                label="Amenities"
                sublabel="On-board services and facilities"
                badge="Optional"
                theme="indigo"
              >
                <FormField
                  control={form.control}
                  name="amenities"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-4 xl:grid-cols-5 gap-1">
                        {AMENITY_OPTIONS.map((amenity) => {
                          const isActive = (field.value ?? []).includes(
                            amenity,
                          );
                          const st = styles["indigo"];
                          return (
                            <button
                              key={amenity}
                              type="button"
                              onClick={() =>
                                field.onChange(
                                  isActive
                                    ? (field.value ?? []).filter(
                                        (a: string) => a !== amenity,
                                      )
                                    : [...(field.value ?? []), amenity],
                                )
                              }
                              className={cn(
                                "rounded-md border-2 p-2.5 text-xs font-medium text-center transition-all duration-150",
                                isActive ? st.active : st.inactive,
                              )}
                            >
                              {amenity}
                            </button>
                          );
                        })}
                      </div>
                    </FormItem>
                  )}
                />
              </Section>

              {/* ── Luggage ── */}
              <Section
                label="Luggage Policy & Notes"
                sublabel="Included allowance and extra fees and Policies, requirements and warnings"
                badge="Optional"
                theme="indigo"
              >
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="luggageAllowance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">
                          Included Allowance
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g. 1 bag, 23 kg"
                            className="h-9 text-sm"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="extraLuggageFee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">
                          Extra Luggage Fee
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                              $
                            </span>
                            <Input
                              {...field}
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              className="h-9 text-sm pl-6"
                            />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="importantNotes"
                  render={({ field }) => (
                    <TagListField
                      values={field.value ?? []}
                      onChange={field.onChange}
                      placeholder="e.g. Passport required, no refund within 24h"
                      theme="indigo"
                    />
                  )}
                />
              </Section>

              {/* ── Submit ── */}
              <div className="pt-4 flex items-center justify-end gap-3">
                <p className="text-xs text-muted-foreground mr-auto">
                  Step 4 of 4 — final step
                </p>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="lg"
                  className="min-w-44 bg-indigo-500 hover:bg-indigo-600 text-white transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Complete Product
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="max-h-[calc(100vh-100px)] overflow-y-auto pr-0.5 pb-4">
              <DynamicCollectionPanel
                title="Schedules"
                subtitle="Manage departures & arrivals"
                fields={fields}
                append={append}
                remove={remove}
                onClearAll={() => replace([])}
                icon={<LayoutList className="h-4 w-4 text-indigo-500" />}
                badgeIcon={<LayoutList className="h-3 w-3" />}
                emptyTitle="No schedules yet"
                emptyDescription="Add your first schedule to define departure and arrival timing"
                addLabel={(n) => `Add Schedule ${n}`}
                addButtonClassName="hover:border-indigo-400/50 hover:bg-indigo-500/5 hover:text-indigo-500"
                badgeClassName="border-indigo-500/20 bg-indigo-500/10 text-indigo-600"
                infoBox={
                  <div className="rounded-md border bg-muted/20 px-3 py-2">
                    {" "}
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      One schedule per variant slot — e.g.{" "}
                      <span className="font-medium text-foreground">
                        Morning
                      </span>{" "}
                      and{" "}
                      <span className="font-medium text-foreground">
                        Evening
                      </span>{" "}
                      departures.{" "}
                      {!hasDirect &&
                        " Add intermediate stops inside each schedule."}{" "}
                    </p>
                  </div>
                }
                createItem={() => ({
                  label: "",
                  departureDate: "",
                  departureTime: "",
                  arrivalDate: "",
                  arrivalTime: "",
                  duration: "",
                  checkInTime: "",
                  stops: [],
                })}
                renderItem={({ field, index, isEditing, onEdit, onRemove }) => (
                  <ScheduleSlice
                    key={field.id}
                    index={index}
                    control={form.control}
                    remove={onRemove}
                    isEditing={isEditing}
                    onEdit={onEdit}
                    hasDirect={hasDirect}
                    setValue={form.setValue}
                  />
                )}
              />
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
