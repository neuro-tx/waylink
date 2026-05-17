"use client";

import { useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Plus,
  Trash2,
  Calendar,
  Users,
  DollarSign,
  Baby,
  User,
  CheckCircle2,
  Pencil,
  ChevronDown,
  LayoutList,
  Tag,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { variantSchema, VariantForm } from "@/validations";
import { fmtDateTime } from "@/lib/helpers";
import { createVarinats } from "@/actions/service.action";
import { useSetupProgress } from "@/components/providers/SetupProgressProvider";

const STATUS_CONFIG = {
  available: {
    label: "Available",
    dot: "bg-emerald-500",
    badge:
      "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
  },
  sold_out: {
    label: "Sold Out",
    dot: "bg-red-500",
    badge: "border-red-500/30 text-red-600 dark:text-red-400 bg-red-500/10",
  },
  cancelled: {
    label: "Cancelled",
    dot: "bg-zinc-400",
    badge: "border-zinc-400/30 text-zinc-500 bg-zinc-400/10",
  },
} as const;

function formatPrice(val: string) {
  const n = Number(val);
  return isNaN(n) ? "—" : `$${n.toFixed(2)}`;
}

function SavedVariantCard({
  variant,
  index,
  onEdit,
  onDelete,
  isEditing,
}: {
  variant: VariantForm;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  isEditing: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[variant.status];

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
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
            isEditing
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          {index + 1}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate leading-tight">
            {variant.name || `Variant ${index + 1}`}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {fmtDateTime(variant.startDate)}
          </p>
        </div>

        <Badge
          variant="outline"
          className={cn(
            "gap-1.5 shrink-0 text-xs font-medium select-none",
            cfg.badge,
          )}
        >
          <div className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
          {cfg.label}
        </Badge>

        <div
          className="flex items-center gap-1 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
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
              </TooltipTrigger>
              <TooltipContent>Edit variant</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive/60 hover:text-destructive hover:bg-destructive/10"
                  onClick={onDelete}
                  type="button"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Remove variant</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200",
            expanded && "rotate-180",
          )}
        />
      </div>

      {expanded && (
        <div className="border-t border-border/50 px-4 py-4 space-y-4 bg-muted/20">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3 w-3" /> Schedule
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
              <div>
                <span className="text-muted-foreground">Start</span>
                <p className="font-medium text-foreground mt-0.5">
                  {fmtDateTime(variant.startDate)}
                </p>
              </div>
              {variant.endDate && (
                <div>
                  <span className="text-muted-foreground">End</span>
                  <p className="font-medium text-foreground mt-0.5">
                    {fmtDateTime(variant.endDate)}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator className="opacity-50" />

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span>Capacity</span>
            </div>
            <span className="font-semibold text-foreground">
              {variant.capacity} spots
            </span>
          </div>

          <Separator className="opacity-50" />

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <DollarSign className="h-3 w-3" /> Pricing
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Adult", icon: User, value: variant.adultPrice },
                { label: "Child", icon: Users, value: variant.childPrice },
                { label: "Infant", icon: Baby, value: variant.infantPrice },
              ].map(({ label, icon: Icon, value }) => (
                <div
                  key={label}
                  className="rounded-lg bg-background border border-border/60 hover:border-border transition-all px-3 py-2 text-center"
                >
                  <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground mb-1">
                    <Icon className="h-3 w-3" />
                    {label}
                  </div>
                  <p className="text-sm font-bold text-foreground">
                    {formatPrice(value || "0")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function VariantEntryForm({
  onSave,
  editingData,
  editingIndex,
  onCancelEdit,
}: {
  onSave: (data: VariantForm) => void;
  editingData: VariantForm | null;
  editingIndex: number | null;
  onCancelEdit: () => void;
}) {
  const isEditing = editingIndex !== null;

  const form = useForm({
    resolver: zodResolver(variantSchema),
    defaultValues: editingData ?? {
      name: "",
      startDate: "",
      endDate: "",
      capacity: "",
      status: "available",
      adultPrice: "",
      childPrice: "",
      infantPrice: "0.00",
    },
  });

  useState(() => {
    if (editingData) form.reset(editingData);
  });

  function handleSubmit(data: VariantForm) {
    onSave(data);
    if (!isEditing) {
      form.reset({
        name: "",
        startDate: "",
        endDate: "",
        capacity: "",
        status: "available",
        adultPrice: "",
        childPrice: "",
        infantPrice: "0.00",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
        {isEditing && (
          <div className="flex items-center justify-between rounded-lg bg-emerald-500/20 border border-emerald-500/50 px-4 py-2.5">
            <div className="flex items-center gap-2 text-sm text-primary font-medium">
              <Pencil className="h-3.5 w-3.5" />
              Editing Variant {editingIndex + 1}
            </div>
            <button
              type="button"
              onClick={onCancelEdit}
              className="text-muted-foreground hover:text-foreground transition-colors bg-transparent"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="rounded-xl border-2 border-primary/30 bg-card overflow-hidden">
          <div className="flex items-center flex-row justify-between gap-3 px-4 py-3 border-b border-border/50 bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="rounded-lg p-1.5 bg-primary/10">
                <Tag className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-sm font-semibold">Identity</span>
            </div>

            {/* ── Action button ── */}
            <div className="flex items-center gap-1 md:gap-2 xl:gap-3">
              <Button type="submit" size="sm" className="cursor-pointer">
                {isEditing ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Update Variant {editingIndex + 1}
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add Variant
                  </>
                )}
              </Button>

              {isEditing && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={onCancelEdit}
                >
                  Cancel editing
                </Button>
              )}
            </div>
          </div>
          <div className="p-4 space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    Variant Label
                    <Badge variant="outline" className="text-xs font-normal">
                      Optional
                    </Badge>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. Morning Slot, VIP Package, Peak Season…"
                      className="h-10 text-sm"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Max Spots <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        type="number"
                        min="1"
                        step="1"
                        placeholder="e.g. 20"
                        className="pl-9 h-10 text-base"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    name: "adultPrice" as const,
                    label: "Adult",
                    Icon: User,
                    required: true,
                  },
                  {
                    name: "childPrice" as const,
                    label: "Child",
                    Icon: Users,
                    required: true,
                  },
                  {
                    name: "infantPrice" as const,
                    label: "Infant",
                    Icon: Baby,
                    required: false,
                  },
                ].map(({ name, label, Icon, required }) => (
                  <FormField
                    key={name}
                    control={form.control}
                    name={name}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs flex items-center gap-1">
                          <Icon className="h-3 w-3" />
                          {label}
                          {required && (
                            <span className="text-destructive">*</span>
                          )}
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
                              className="h-10 text-sm pl-6"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Infant defaults to free if left empty
              </p>
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <div className="grid grid-cols-3 gap-2">
                    {(["available", "sold_out", "cancelled"] as const).map(
                      (s) => {
                        const cfg = STATUS_CONFIG[s];
                        const isActive = field.value === s;
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => field.onChange(s)}
                            className={cn(
                              "flex flex-col items-start gap-1 rounded-lg border px-3 py-4 text-left transition-all",
                              isActive
                                ? "border-primary bg-primary/5"
                                : "border-border bg-background hover:bg-accent/30",
                            )}
                          >
                            <div
                              className={cn("h-2 w-2 rounded-full", cfg.dot)}
                            />
                            <span className="text-xs font-semibold leading-tight">
                              {cfg.label}
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
        </div>

        {/* ── Section: Schedule ── */}
        <div className="rounded-xl border-2 border-primary/30 bg-card overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-muted/30">
            <div className="rounded-lg p-1.5 bg-primary/10">
              <Calendar className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-sm font-semibold">Schedule</span>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">
                      Start Date <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        className="h-10 text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs flex items-center justify-between">
                      End Date
                      <span className="text-muted-foreground font-normal text-[10px]">
                        optional
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        className="h-10 text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}

function EmptyVariants() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-3">
      <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center">
        <LayoutList className="h-7 w-7 text-muted-foreground/40" />
      </div>
      <div>
        <p className="font-semibold text-foreground text-sm">No variants yet</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-55 leading-relaxed">
          Fill in the form on the left and click "Add Variant" to build your
          availability list
        </p>
      </div>
    </div>
  );
}

export default function CreateVariantsPage() {
  const router = useRouter();
  const params = useParams();
  const serviceId = params.id as string;

  const [savedVariants, setSavedVariants] = useState<VariantForm[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const { updateProgress } = useSetupProgress();

  function handleSave(data: VariantForm) {
    if (editingIndex !== null) {
      setSavedVariants((prev) =>
        prev.map((v, i) => (i === editingIndex ? data : v)),
      );
      setEditingIndex(null);
    } else {
      setSavedVariants((prev) => [...prev, data]);
    }
  }

  function handleEdit(index: number) {
    setEditingIndex((prev) => (prev === index ? null : index));
  }

  function handleDelete(index: number) {
    setSavedVariants((prev) => prev.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
    else if (editingIndex !== null && editingIndex > index) {
      setEditingIndex((prev) => (prev !== null ? prev - 1 : null));
    }
  }

  function handlePublish() {
    if (savedVariants.length === 0) return;
    startTransition(async () => {
      try {
        const res = await createVarinats(serviceId, savedVariants);
        if (!res.success) {
          setError(res.error);
          return;
        }

        updateProgress({
          hasVariants: true,
        });
        router.push(`/provider/services/create/${serviceId}/locations`);
      } catch (error) {
        console.error(error);
        setError("Something went wrong");
      }
    });
  }

  const editingData =
    editingIndex !== null ? savedVariants[editingIndex] : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-4 md:px-6 py-8">
        {/* Product ID pill */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground tracking-tight">
              Add availability
            </h2>
            <p className="mt-1.5 text-muted-foreground">
              Build your variants on the left — they'll appear on the right
              ready to save.
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

        {/* ── Two-column layout ── */}
        {error && <p className="text-base text-red-500 my-3">{error}</p>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* ── Left: Entry form ── */}
          <div className="lg:sticky lg:top-20">
            <div className="mb-4 flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center">
                <Pencil className="h-3.5 w-3.5 text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                {editingIndex !== null ? "Edit Variant" : "New Variant"}
              </p>
            </div>

            <VariantEntryForm
              key={editingIndex ?? "new"} // remount on edit switch
              onSave={handleSave}
              editingData={editingData}
              editingIndex={editingIndex}
              onCancelEdit={() => setEditingIndex(null)}
            />
          </div>

          {/* ── Right: Saved variants list ── */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-muted flex items-center justify-center">
                  <LayoutList className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold text-foreground">
                  Saved Variants
                </p>
              </div>
              {savedVariants.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {savedVariants.length} of {savedVariants.length} ready
                </p>
              )}
            </div>

            {/* List */}
            <div className="space-y-2.5">
              {savedVariants.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-border bg-card/40">
                  <EmptyVariants />
                </div>
              ) : (
                savedVariants.map((variant, i) => (
                  <SavedVariantCard
                    key={i}
                    variant={variant}
                    index={i}
                    onEdit={() => handleEdit(i)}
                    onDelete={() => handleDelete(i)}
                    isEditing={editingIndex === i}
                  />
                ))
              )}
            </div>

            {/* Publish footer */}
            {savedVariants.length > 0 && (
              <div className="mt-6 rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {savedVariants.length} variant
                    {savedVariants.length !== 1 ? "s" : ""} ready to save
                  </span>
                  <span className="text-xs font-mono text-muted-foreground truncate max-w-50">
                    → product/{serviceId}
                  </span>
                </div>

                <Separator className="opacity-50" />

                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() =>
                      router.push(
                        `/provider/services/create/${serviceId}/locations`,
                      )
                    }
                  >
                    Skip for now
                  </Button>
                  <Button
                    type="button"
                    onClick={handlePublish}
                    disabled={pending}
                    className="flex-1"
                  >
                    {pending ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Save & Continue
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
