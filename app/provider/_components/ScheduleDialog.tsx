"use client";

import { useEffect } from "react";
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
import { Plus, Check, X } from "lucide-react";
import { scheduleSchema, ScheduleType, VariantForm } from "@/validations";

type Variant = VariantForm & {
  id: string;
};
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

  if (!variant) return null;

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
                      <FormLabel>Arrival date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
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
