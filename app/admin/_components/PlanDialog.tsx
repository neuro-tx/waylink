"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, X, Loader2, AlertCircle, Save } from "lucide-react";
import { PlanFormValues, planSchema } from "@/validations";
import { Plan } from "@/lib/all-types";
import { PlanMutationResult } from "@/hooks/usePlans";

type SavePlanFn = (
  mode: "create" | "update",
  values: PlanFormValues,
  id?: string,
) => Promise<PlanMutationResult>;

interface AddPlanDialogProps {
  trigger: React.ReactNode;
  mode: "create" | "update";
  savePlan: SavePlanFn;
  defaultValues?: Plan;
}

const sectionClass = "flex flex-col gap-0";
const labelClass =
  "text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3 block";

const PlanDialog = ({
  trigger,
  defaultValues,
  mode,
  savePlan,
}: AddPlanDialogProps) => {
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const id = defaultValues?.id;

  function planToFormValues(plan?: Plan): PlanFormValues {
    return {
      name: plan?.name ?? "",
      tier: plan?.tier ?? "pro",
      price: plan?.price ?? 0,
      isFree: plan?.isFree ?? false,
      priorityBoost: Number(plan?.priorityBoost ?? 1),
      featuredInSearch: plan?.featuredInSearch ?? false,
      badgeLabel: plan?.badgeLabel ?? "",
      billingCycle: plan?.billingCycle ?? "monthly",
      commissionRate: Number(plan?.commissionRate ?? 0),
      maxListings: plan?.maxListings ?? null,
      description: plan?.description ?? "",
      isActive: plan?.isActive ?? true,
      highlights: plan?.highlights ?? [],
      trialEnabled: plan?.trialEnabled ?? false,
      trialDays: plan?.trialDays ?? null,
    };
  }

  const form = useForm({
    resolver: zodResolver(planSchema),
    defaultValues: planToFormValues(defaultValues),
  });

  const {
    formState: { isDirty, isSubmitting },
  } = form;

  const canUpdate = mode === "create" || isDirty;

  useEffect(() => {
    form.reset(planToFormValues(defaultValues));
  }, [defaultValues, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    // @ts-expect-error highlights is a string array, react-hook-form fieldArray expects objects
    name: "highlights",
  });

  const isFree = form.watch("isFree");
  const trialEnabled = form.watch("trialEnabled");
  const submitting = form.formState.isSubmitting;

  const handleSubmit = async (values: PlanFormValues) => {
    setSubmitError(null);

    try {
      const res = await savePlan(mode, values, id);

      if (!res.success) {
        setSubmitError(res.error);
        return;
      }

      form.reset();
      setOpen(false);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next && submitting) return;
    if (!next) {
      form.reset();
      setSubmitError(null);
    }
    setOpen(next);
  };

  const trialEndsAt = useMemo(() => {
    const enabled = form.watch("trialEnabled");
    const days = form.watch("trialDays");

    if (!enabled || !days) return null;

    const date = new Date();
    date.setDate(date.getDate() + days);

    return date;
  }, [form.watch("trialEnabled"), form.watch("trialDays")]);

  return (
    <>
      <span onClick={() => setOpen(true)} className="contents">
        {trigger}
      </span>

      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogContent className="w-full p-0 gap-0 overflow-hidden">
          <AlertDialogHeader className="border-b border-border px-6 py-3">
            <div className="space-y-1">
              <AlertDialogTitle className="font-mono text-lg font-semibold">
                {mode === "create" ? "Plan Creation" : "Update Plan"} Form
              </AlertDialogTitle>

              {mode === "update" && !isDirty && (
                <p className="text-sm text-muted-foreground">
                  No changes detected.
                </p>
              )}
            </div>
          </AlertDialogHeader>

          <ScrollArea className="max-h-[55dvh]">
            <Form {...form}>
              <form
                id="add-plan-form"
                onSubmit={form.handleSubmit(handleSubmit)}
                className="px-6 py-5 flex flex-col gap-5"
              >
                {/* ── BASICS ─────────────────────────────────────────── */}
                <div className={sectionClass}>
                  <span className={labelClass}>Basics</span>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Name */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="col-span-2 sm:col-span-1">
                          <FormLabel className="text-xs">
                            Plan name{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Pro Monthly"
                              className="h-8 text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    {/* Tier */}
                    <FormField
                      control={form.control}
                      name="tier"
                      render={({ field }) => (
                        <FormItem className="col-span-2 sm:col-span-1">
                          <FormLabel className="text-xs">
                            Tier <span className="text-destructive">*</span>
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue placeholder="Select tier" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {["free", "pro", "business", "enterprise"].map(
                                (t) => (
                                  <SelectItem
                                    key={t}
                                    value={t}
                                    className="text-xs capitalize"
                                  >
                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    {/* Badge label */}
                    <FormField
                      control={form.control}
                      name="badgeLabel"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel className="text-xs">Badge label</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='e.g. "Most popular"'
                              className="h-8 text-sm"
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Optional label shown on the plan card.
                          </FormDescription>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    {/* Description */}
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel className="text-xs">Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="A brief description of what's included..."
                              className="text-sm resize-none"
                              rows={3}
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* ── PRICING ────────────────────────────────────────── */}
                <div className={sectionClass}>
                  <span className={labelClass}>Pricing</span>
                  <div className="grid grid-cols-2 gap-4">
                    {/* isFree toggle */}
                    <FormField
                      control={form.control}
                      name="isFree"
                      render={({ field }) => (
                        <FormItem className="col-span-2 flex items-center justify-between rounded-lg border border-border/60 px-4 py-3">
                          <div>
                            <FormLabel className="text-sm font-medium">
                              Free plan
                            </FormLabel>
                            <FormDescription className="text-xs">
                              Price will be forced to $0.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                                if (checked) form.setValue("price", 0);
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Price */}
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">
                            Price (cents){" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              className="h-8 text-sm"
                              disabled={isFree}
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  parseInt(e.target.value, 10) || 0,
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    {/* Billing cycle */}
                    <FormField
                      control={form.control}
                      name="billingCycle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">
                            Billing cycle
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="monthly" className="text-xs">
                                Monthly
                              </SelectItem>
                              <SelectItem value="yearly" className="text-xs">
                                Yearly
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    {/* Commission rate */}
                    <FormField
                      control={form.control}
                      name="commissionRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">
                            Commission rate (%){" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              max={50}
                              className="h-8 text-sm"
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ""
                                    ? 0
                                    : Number(e.target.value),
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* ── FEATURES ───────────────────────────────────────── */}
                <div className={sectionClass}>
                  <span className={labelClass}>Features & limits</span>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Priority boost */}
                      <FormField
                        control={form.control}
                        name="priorityBoost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              Priority boost
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                max={9.99}
                                step={0.1}
                                className="h-8 text-sm"
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ""
                                      ? 0
                                      : Number(e.target.value),
                                  )
                                }
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              0 – 9.99
                            </FormDescription>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      {/* Max listings */}
                      <FormField
                        control={form.control}
                        name="maxListings"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              Max listings
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                placeholder="Unlimited"
                                className="h-8 text-sm"
                                {...field}
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value
                                      ? parseInt(e.target.value, 10)
                                      : null,
                                  )
                                }
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              Leave blank for unlimited.
                            </FormDescription>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Featured in search */}
                    <FormField
                      control={form.control}
                      name="featuredInSearch"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3">
                          <div>
                            <FormLabel className="text-sm font-medium">
                              Featured in search
                            </FormLabel>
                            <FormDescription className="text-xs">
                              Boosted placement in results.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Is active */}
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3">
                          <div>
                            <FormLabel className="text-sm font-medium">
                              Active
                            </FormLabel>
                            <FormDescription className="text-xs">
                              Visible and available to users.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Highlights */}
                  <div className="flex flex-col gap-2 mt-1">
                    <FormLabel className="text-xs">Highlights</FormLabel>
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-1">
                        <FormField
                          control={form.control}
                          name={`highlights.${index}`}
                          render={({ field }) => (
                            <FormItem className="flex-1 mb-0">
                              <FormControl>
                                <Input
                                  placeholder={`Highlight ${index + 1}`}
                                  className="h-8 text-sm"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => remove(index)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 w-fit gap-1.5 text-xs mt-1"
                      onClick={() => append("")}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add highlight
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* ── TRIAL ──────────────────────────────────────────── */}
                <div className={sectionClass}>
                  <span className={labelClass}>Trial</span>
                  <FormField
                    control={form.control}
                    name="trialEnabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3">
                        <div>
                          <FormLabel className="text-sm font-medium">
                            Enable trial
                          </FormLabel>
                          <FormDescription className="text-xs">
                            Offer a free trial period for this plan.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {trialEnabled && (
                    <FormField
                      control={form.control}
                      name="trialDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs mt-2">
                            Trial days{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              className="h-8 text-sm"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    ? parseInt(e.target.value, 10)
                                    : null,
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                          {trialEndsAt && (
                            <p className="text-sm mt-1 text-right">
                              Trial ends at:{" "}
                              <span className="font-medium underline text-emerald-500">
                                {trialEndsAt.toLocaleDateString()}
                              </span>
                            </p>
                          )}
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* Submit error */}
                {submitError && (
                  <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-xs text-destructive">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <p>{submitError}</p>
                  </div>
                )}
              </form>
            </Form>
          </ScrollArea>

          {/* Footer */}
          <AlertDialogFooter className="px-6 py-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              form="add-plan-form"
              size="sm"
              className="cursor-pointer"
              disabled={isSubmitting || !canUpdate}
            >
              {isSubmitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : mode === "create" ? (
                <Plus />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}

              {isSubmitting
                ? mode === "create"
                  ? "Creating..."
                  : "Updating..."
                : mode === "create"
                  ? "Create plan"
                  : "Update plan"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PlanDialog;
