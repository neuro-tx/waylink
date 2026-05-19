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
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Loader } from "lucide-react";
import { cn } from "@/lib/utils";
import { TransportForm, transportSchema } from "@/validations";
import { Section, TagListField } from "./ServiceUtils";
import { Switch } from "@/components/ui/switch";

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
    },
  });

  return (
    <div className="w-full px-4 md:px-6 py-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            Transport details
          </h2>
          <p className="mt-1.5 text-muted-foreground">
            Configure the vehicle, class, and policies on the left. Add
            per-variant schedules on the right.
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-3 py-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
          <div>
            <p className="text-[10px] text-muted-foreground">Service ID</p>
            <p className="text-xs font-mono text-foreground">{productId}</p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onFinish)}>
          <div className="w-full overflow-x-hidden">
            <div className="grid xl:grid-cols-2 gap-5">
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
                <FormField
                  control={form.control}
                  name="hasDirectRoute"
                  render={({ field }) => (
                    <FormItem className="rounded-lg border bg-card p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <FormLabel className="text-sm font-semibold">
                            Route Type
                          </FormLabel>

                          <p className="text-xs leading-relaxed">
                            Choose whether this trip goes directly to the
                            destination or includes multiple stops/stations
                            along the route.
                          </p>

                          <div className="flex items-center gap-2 pt-2 font-georgia">
                            <span
                              className={cn(
                                "text-sm font-medium transition-colors",
                                field.value
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-muted-foreground",
                              )}
                            >
                              Direct Route
                            </span>

                            <span className="text-muted-foreground">•</span>

                            <span
                              className={cn(
                                "text-sm font-medium transition-colors",
                                !field.value
                                  ? "text-indigo-600 dark:text-indigo-400"
                                  : "text-muted-foreground",
                              )}
                            >
                              Multi Station
                            </span>
                          </div>
                        </div>

                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />

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

              {/* ── Amenities & Luggage ── */}
              <Section
                label="Amenities & Luggage Policy"
                sublabel="On-board services and facilities and Included allowance and extra fees and Policies, requirements and warnings"
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
            </div>

            {/* ── Submit ── */}
            <div className="pt-5 flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Step 4 of 4 — final step
              </p>
              <Button
                type="submit"
                disabled={isSubmitting}
                size="lg"
                className="min-w-40 bg-indigo-500 hover:bg-indigo-600 text-white transition-colors cursor-pointer font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="animate-spin size-4" />
                    Saving…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Submit
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
