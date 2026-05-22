"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray, Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Plus, Check, X, CalendarDays, Calculator } from "lucide-react";
import { scheduleSchema, ScheduleType, VariantForm } from "@/validations";
import { Variant } from "@/lib/all-types";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface ScheduleDialogProps {
  open: boolean;
  variant: Variant | null;
  onClose: () => void;
  onSubmit: (schedule: ScheduleType) => void;
}

export function ScheduleDialog({
  open,
  variant,
  onClose,
  onSubmit,
}: ScheduleDialogProps) {
  if (!variant) return null;

  const [sameDay, setSameDay] = useState(false);
  const [computedArrival, setComputedArrival] = useState<string>("");

  const form = useForm({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      variantId: "",
      label: "",
      departureDate: "",
      arrivalDate: "",
      duration: "",
      checkInTime: "",
      stops: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "stops",
  });

  useEffect(() => {
    if (open && variant) {
      form.reset({
        variantId: variant.id,
        label: "",
        departureDate: "",
        arrivalDate: "",
        duration: "",
        checkInTime: "",
        stops: [],
      });
    }
  }, [open, variant, form]);

  function handleSubmit(values: ScheduleType) {
    const schedule: ScheduleType = {
      variantId: values.variantId,
      label: values.label || undefined,
      departureDate: values.departureDate,
      arrivalDate: values.arrivalDate,
      duration: values.duration,
      checkInTime: values.checkInTime || undefined,
      stops: values.stops ?? undefined,
    };

    onSubmit(schedule);
    onClose();
  }

  const watchedDeparture = form.watch("departureDate");

  // Compute arrival date when sameDay is on
  useEffect(() => {
    if (!sameDay) return;

    if (!watchedDeparture) {
      setComputedArrival("");
      form.setValue("arrivalDate", "");
      return;
    }

    const departure = new Date(watchedDeparture + "T00:00:00");
    if (isNaN(departure.getTime())) return;

    const arrival = new Date(departure.getTime());
    const isoDate = arrival.toISOString().split("T")[0];

    setComputedArrival(
      arrival.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    );

    form.setValue("arrivalDate", isoDate, {
      shouldDirty: true,
    });
  }, [sameDay, watchedDeparture]);

  useEffect(() => {
    if (!sameDay) {
      setComputedArrival("");
    }
  }, [sameDay]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="p-0 gap-0 overflow-hidden rounded-2xl border-border">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <DialogTitle className="text-lg font-semibold">
                Add schedule
              </DialogTitle>

              <DialogDescription className="text-sm text-muted-foreground">
                Creating a schedule for this variant
              </DialogDescription>

              <Badge
                variant="outline"
                className="text-xs font-mono bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800 px-3 py-1"
              >
                #{variant.id} · {variant.name || "Unnamed"}
              </Badge>
            </div>
          </div>

          <div
            className={cn(
              "flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-colors",
              sameDay
                ? "bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800"
                : "bg-muted/40 border-border",
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={cn(
                  "shrink-0 flex items-center justify-center w-8 h-8 rounded-lg transition-colors",
                  sameDay
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <CalendarDays className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p
                  className={cn(
                    "text-sm font-medium leading-none transition-colors",
                    sameDay
                      ? "text-blue-800 dark:text-blue-200"
                      : "text-foreground",
                  )}
                >
                  Same-day trip
                </p>
                <p
                  className={cn(
                    "text-xs mt-0.5 truncate transition-colors",
                    sameDay
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-muted-foreground",
                  )}
                >
                  {sameDay
                    ? "Arrival calculated from departure + duration"
                    : "Set arrival date manually"}
                </p>
              </div>
            </div>
            <Switch
              checked={sameDay}
              onCheckedChange={setSameDay}
              className="shrink-0"
            />
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
              <input type="hidden" {...form.register("variantId")} />
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-muted-foreground">
                      Label
                    </FormLabel>

                    <FormControl>
                      <Input
                        placeholder="Morning departure..."
                        className="text-sm"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3 items-baseline">
                <FormField
                  control={form.control}
                  name="departureDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departure date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="arrivalDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-muted-foreground">
                        Arrival date
                      </FormLabel>
                      <FormControl>
                        {sameDay ? (
                          <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-muted/50 text-sm text-muted-foreground">
                            <Calculator className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">
                              {computedArrival || "Set departure + duration"}
                            </span>
                          </div>
                        ) : (
                          <Input
                            type="date"
                            className="text-sm h-9"
                            {...field}
                          />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Duration */}
              <div className="grid grid-cols-2 gap-3 items-baseline">
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Duration time (min)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="checkInTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check-in time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Stops */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">
                    Stops
                  </p>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      append({
                        locationName: "",
                        arrivalTime: "",
                        departureTime: "",
                      })
                    }
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add stop
                  </Button>
                </div>

                {fields.length > 0 && (
                  <div className="space-y-2">
                    {fields.map((field, index) => (
                      <StopRow
                        key={field.id}
                        stopIdx={index}
                        control={form.control}
                        remove={() => remove(index)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="px-6 py-4 border-t border-border bg-muted/20">
              <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>

              <Button type="submit" size="sm" className="gap-1.5">
                <Check className="w-3.5 h-3.5" />
                Create schedule
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function StopRow({
  stopIdx,
  control,
  remove,
}: {
  stopIdx: number;
  control: Control<ScheduleType>;
  remove: () => void;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto_auto_28px] gap-2 items-start rounded-md border border-border/60 bg-muted/30 p-2.5 hover:bg-muted/40 hover:border-border">
      <FormField
        control={control}
        name={`stops.${stopIdx}.locationName`}
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
        name={`stops.${stopIdx}.arrivalTime`}
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
        name={`stops.${stopIdx}.departureTime`}
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
        className="h-8 w-8 self-end flex items-center justify-center rounded-md text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
