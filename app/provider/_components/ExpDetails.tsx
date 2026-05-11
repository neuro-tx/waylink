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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Compass,
  Mountain,
  Clock,
  ChevronDown,
  Trash2,
  CheckCircle2,
  Utensils,
  BedDouble,
  ListChecks,
  ShieldAlert,
  X,
  CalendarDays,
  Pencil,
  LayoutList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ExperienceForm, experienceSchema } from "@/validations";
import { DynamicCollectionPanel, Section, TagListField } from "./ServiceUtils";
import { ExperienceType } from "@/lib/all-types";

const EXPERIENCE_TYPES: {
  value: ExperienceType;
  label: string;
}[] = [
  { value: "tour", label: "Tour" },
  { value: "adventure", label: "Adventure" },
  { value: "cultural", label: "Cultural" },
  { value: "entertainment", label: "Entertainment" },
  { value: "food_drink", label: "Food & Drink" },
  { value: "sports", label: "Sports" },
  { value: "wellness", label: "Wellness" },
  { value: "water", label: "Water" },
  { value: "wildlife", label: "Wildlife" },
  { value: "photography", label: "Photography" },
  { value: "nature", label: "Nature" },
  { value: "shopping", label: "Shopping" },
  { value: "nightlife", label: "Nightlife" },
  { value: "learning", label: "Learning" },
  { value: "seasonal", label: "Seasonal" },
];

const DIFFICULTY_LEVELS = [
  {
    value: "easy",
    label: "Easy",
    color: "text-emerald-500",
    bg: "bg-emerald-500/15 border-emerald-500/30",
    dot: "bg-emerald-500",
  },
  {
    value: "moderate",
    label: "Moderate",
    color: "text-yellow-500",
    bg: "bg-yellow-500/15 border-yellow-500/30",
    dot: "bg-yellow-500",
  },
  {
    value: "challenging",
    label: "Challenging",
    color: "text-orange-500",
    bg: "bg-orange-500/15 border-orange-500/30",
    dot: "bg-orange-500",
  },
  {
    value: "extreme",
    label: "Extreme",
    color: "text-red-500",
    bg: "bg-red-500/15 border-red-500/30",
    dot: "bg-red-500",
  },
] as const;

const DURATION_UNITS = ["minutes", "hours", "days"] as const;
const MEAL_OPTIONS = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snacks",
  "Drinks",
] as const;

function ItineraryDaySlice({
  index,
  control,
  remove,
  isEditing,
  onEdit,
}: {
  index: number;
  control: any;
  remove: () => void;
  isEditing: boolean;
  onEdit: () => void;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(isEditing);
  }, [isEditing]);

  const title = useWatch({ control, name: `itinerary.${index}.title` });
  const meals = useWatch({
    control,
    name: `itinerary.${index}.mealsIncluded`,
  }) as string[] | undefined;
  const activities = useWatch({
    control,
    name: `itinerary.${index}.activities`,
  }) as string[] | undefined;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div
        className={cn(
          "rounded-xl border-2 overflow-hidden transition-all duration-200",
          isEditing
            ? "border-primary/60"
            : "border-border bg-card hover:border-border/80",
        )}
      >
        <div
          className={cn(
            "flex items-center gap-3 px-4 py-3",
            isEditing && "bg-primary/10",
          )}
        >
          <div
            className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-colors",
              isEditing
                ? "bg-primary text-primary-foreground"
                : "text-white bg-orange-500",
            )}
          >
            D{index + 1}
          </div>

          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => setOpen((v) => !v)}
          >
            <p className="text-sm font-semibold truncate leading-tight">
              {title || `Day ${index + 1} — untitled`}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              {meals && meals.length > 0 && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Utensils className="h-2.5 w-2.5" /> {meals.join(", ")}
                </span>
              )}
              {activities && activities.length > 0 && (
                <span className="text-[10px] text-muted-foreground">
                  · {activities.length} activit
                  {activities.length === 1 ? "y" : "ies"}
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
                  ? "bg-primary/20 text-primary"
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
          <div className="border-t border-border/50 px-4 py-4 bg-muted/20 space-y-4">
            <FormField
              control={control}
              name={`itinerary.${index}.description`}
              render={({ field }) => (
                <div>
                  <p className="text-xs font-meduim uppercase text-muted-foreground mb-1.5">
                    Description
                  </p>
                  {isEditing ? (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Describe what happens this day…"
                          className="resize-none h-20 text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  ) : (
                    <p className="text-sm text-foreground leading-relaxed">
                      {field.value || (
                        <span className="text-gray-light italic">
                          No description yet
                        </span>
                      )}
                    </p>
                  )}
                </div>
              )}
            />

            {isEditing && (
              <FormField
                control={control}
                name={`itinerary.${index}.title`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">
                      Day Title <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. Arrival & City Tour"
                        className="text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Separator className="opacity-40" />

            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground mb-2">
                Activities
              </p>
              {isEditing ? (
                <FormField
                  control={control}
                  name={`itinerary.${index}.activities`}
                  render={({ field }) => (
                    <TagListField
                      values={field.value ?? []}
                      onChange={field.onChange}
                      placeholder="Add an activity…"
                      theme="orange"
                    />
                  )}
                />
              ) : activities && activities.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {activities.map((a, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {a}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-light italic">None added</p>
              )}
            </div>

            <Separator className="opacity-40" />

            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <Utensils className="h-3 w-3" /> Meals Included
              </p>
              <FormField
                control={control}
                name={`itinerary.${index}.mealsIncluded`}
                render={({ field }) =>
                  isEditing ? (
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {MEAL_OPTIONS.map((meal) => {
                        const selected = (field.value ?? []).includes(meal);
                        return (
                          <button
                            key={meal}
                            type="button"
                            onClick={() =>
                              field.onChange(
                                selected
                                  ? (field.value ?? []).filter(
                                      (m: string) => m !== meal,
                                    )
                                  : [...(field.value ?? []), meal],
                              )
                            }
                            className={cn(
                              "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                              selected
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-background hover:bg-accent/30 text-muted-foreground",
                            )}
                          >
                            {meal}
                          </button>
                        );
                      })}
                    </div>
                  ) : field.value && field.value.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {field.value.map((m: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          <Utensils className="size-2.5" /> {m}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground/50 italic">
                      No meals included
                    </p>
                  )
                }
              />
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
                <BedDouble className="h-3 w-3" /> Accommodation
              </p>
              <FormField
                control={control}
                name={`itinerary.${index}.accommodationInfo`}
                render={({ field }) =>
                  isEditing ? (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. 4-star hotel in the city centre"
                          className="text-sm"
                        />
                      </FormControl>
                    </FormItem>
                  ) : (
                    <p className="text-sm text-foreground">
                      {field.value || (
                        <span className="text-gray-light italic">
                          Not specified
                        </span>
                      )}
                    </p>
                  )
                }
              />
            </div>

            {isEditing && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={onEdit}
              >
                <CheckCircle2 className="size-3.5 text-emerald-500" /> Done
                editing
              </Button>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

interface ExperienceDetailsProps {
  productId: string;
  onFinish: (data: ExperienceForm) => void;
  isSubmitting?: boolean;
}

export function ExperienceDetailsPage({
  productId,
  onFinish,
  isSubmitting = false,
}: ExperienceDetailsProps) {
  const form = useForm({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      durationUnit: "days",
      included: [],
      notIncluded: [],
      requirements: [],
      itinerary: [],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "itinerary",
  });

  const durationUnit = useWatch({
    control: form.control,
    name: "durationUnit",
  });
  const durationCount = useWatch({
    control: form.control,
    name: "durationCount",
  });
  const showItinerary = durationUnit === "days";
  const maxDays = showItinerary ? Math.max(0, Number(durationCount) || 0) : 0;

  return (
    <div className="w-full px-4 md:px-6 py-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            Experience details
          </h2>
          <p className="mt-1.5 text-muted-foreground">
            Fill in the configuration on the left. If this is a multi-day
            experience, build the day-by-day itinerary on the right.
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 shrink-0">
          <Compass className="h-3.5 w-3.5 text-emerald-500" />
          <div>
            <p className="text-[10px] text-muted-foreground">Experience</p>
            <p className="text-xs font-mono text-foreground truncate max-w-35">
              {productId}
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onFinish)}>
          {/* ── Two-column layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-[1fr_550px] gap-8 items-start">
            <div className="space-y-3">
              <Section
                theme="orange"
                icon={Mountain}
                label="Type & Difficulty & Duration"
                sublabel="Define the activity category, challenge level, and expected duration"
                defaultOpen
              >
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Difficulty Level{" "}
                    <span className="normal-case font-normal">(optional)</span>
                  </p>
                  <FormField
                    control={form.control}
                    name="experienceType"
                    render={({ field }) => (
                      <FormItem>
                        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-3 2xl:grid-cols-5 gap-3">
                          {EXPERIENCE_TYPES.map(({ value, label }) => {
                            const isActive = field.value === value;

                            return (
                              <button
                                key={value}
                                type="button"
                                onClick={() => field.onChange(value)}
                                className={cn(
                                  "flex flex-col items-center justify-center gap-3 rounded-xl border-2 p-4 text-center transition-all duration-300",
                                  isActive
                                    ? "border-orange-500/60 bg-orange-500/15"
                                    : "border-orange-500/30 bg-card hover:border-orange-500/50 hover:bg-orange-500/5",
                                )}
                              >
                                <span
                                  className={cn(
                                    "text-sm font-bold transition-colors",
                                    isActive
                                      ? "text-orange-600 dark:text-orange-400"
                                      : "text-muted-foreground",
                                  )}
                                >
                                  {label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Separator className="opacity-40" />
                {/* Difficulty */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Difficulty Level{" "}
                    <span className="normal-case font-normal">(optional)</span>
                  </p>
                  <FormField
                    control={form.control}
                    name="difficultyLevel"
                    render={({ field }) => (
                      <FormItem>
                        <div className="grid grid-cols-4 gap-2">
                          {DIFFICULTY_LEVELS.map(
                            ({ value, label, color, dot, bg }) => {
                              const isActive = field.value === value;
                              return (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() =>
                                    field.onChange(isActive ? undefined : value)
                                  }
                                  className={cn(
                                    "flex flex-col items-start gap-1.5 rounded-xl border-2 p-3.5 transition-all",
                                    isActive
                                      ? bg
                                      : "border-border bg-background hover:bg-accent/30",
                                  )}
                                >
                                  <div
                                    className={cn(
                                      "h-2.5 w-2.5 rounded-full",
                                      dot,
                                    )}
                                  />
                                  <span
                                    className={cn(
                                      "text-xs font-bold",
                                      isActive ? color : "text-foreground",
                                    )}
                                  >
                                    {label}
                                  </span>
                                </button>
                              );
                            },
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator className="opacity-40" />

                {/* Duration */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Duration <span className="text-destructive">*</span>
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name="durationCount"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  {...field}
                                  type="number"
                                  min="1"
                                  step="1"
                                  placeholder="e.g. 3"
                                  className="pl-9 h-10 text-base"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="durationUnit"
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-10">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {DURATION_UNITS.map((u) => (
                                <SelectItem
                                  key={u}
                                  value={u}
                                  className="capitalize"
                                >
                                  {u}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {showItinerary && (
                    <p className="mt-2 text-xs text-primary/80 flex items-center gap-1.5">
                      <CalendarDays className="h-3 w-3" />
                      Multi-day — build the itinerary in the panel on the right
                      →
                    </p>
                  )}
                </div>
              </Section>

              {/* Inclusions */}
              <Section
                icon={ListChecks}
                label="Inclusions & Requirements & Age restriction"
                sublabel="Specify what’s included, participant requirements, and age limits"
                theme="orange"
                defaultOpen
              >
                <div>
                  <FormLabel className="text-xs flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />{" "}
                    What's Included
                  </FormLabel>
                  <FormField
                    control={form.control}
                    name="included"
                    render={({ field }) => (
                      <TagListField
                        values={field.value ?? []}
                        onChange={field.onChange}
                        placeholder="e.g. Hotel pickup & drop-off"
                        theme="orange"
                      />
                    )}
                  />
                </div>
                <Separator className="opacity-40" />
                <div>
                  <FormLabel className="text-xs flex items-center gap-1.5 mb-2">
                    <X className="h-3.5 w-3.5 text-red-500" /> Not Included
                  </FormLabel>
                  <FormField
                    control={form.control}
                    name="notIncluded"
                    render={({ field }) => (
                      <TagListField
                        values={field.value ?? []}
                        onChange={field.onChange}
                        placeholder="e.g. Travel insurance"
                        theme="orange"
                      />
                    )}
                  />
                </div>
                <Separator className="opacity-40" />
                <div>
                  <FormLabel className="text-xs flex items-center gap-1.5 mb-2">
                    <ShieldAlert className="h-3.5 w-3.5 text-yellow-500" />{" "}
                    Requirements
                  </FormLabel>
                  <FormField
                    control={form.control}
                    name="requirements"
                    render={({ field }) => (
                      <TagListField
                        values={field.value ?? []}
                        onChange={field.onChange}
                        placeholder="e.g. Comfortable walking shoes"
                        theme="orange"
                      />
                    )}
                  />
                </div>
                <Separator className="opacity-40" />
                <FormField
                  control={form.control}
                  name="ageRestriction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Restriction note</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. Minimum age 12, maximum age 70"
                          className="h-10 text-sm"
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        Leave blank if there's no restriction
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Section>

              {/* Submit */}
              <div className="pt-4 flex items-center justify-end gap-3">
                <p className="text-xs text-muted-foreground mr-auto">
                  Step 4 of 4 — final step
                </p>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="lg"
                  className="gap-2 min-w-44 bg-orange-500 hover:bg-orange-600 text-white transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
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
                title="Itinerary"
                subtitle="Build your travel timeline"
                fields={fields}
                append={append}
                remove={remove}
                maxItems={maxDays}
                onClearAll={() => replace([])}
                icon={<CalendarDays className="h-4 w-4 text-primary" />}
                badgeIcon={<LayoutList className="h-3 w-3" />}
                emptyTitle="No days yet"
                emptyDescription="Start building your itinerary by adding Day 1"
                addLabel={(n) => `Add Day ${n}`}
                createItem={(index) => ({
                  dayNumber: index + 1,
                  title: "",
                  description: "",
                  activities: [],
                  mealsIncluded: [],
                  accommodationInfo: "",
                })}
                renderItem={({ field, index, isEditing, onEdit, onRemove }) => (
                  <ItineraryDaySlice
                    key={field.id}
                    index={index}
                    control={form.control}
                    remove={onRemove}
                    isEditing={isEditing}
                    onEdit={onEdit}
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
