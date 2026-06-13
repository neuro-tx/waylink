"use client";

import React, { useEffect, useState, useTransition } from "react";
import {
  Search,
  X,
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  Ban,
  Loader,
  AlertCircle,
  Activity,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import PlanDialog from "./PlanDialog";
import { useDebounce } from "@/hooks/useDebounce";
import { motion } from "framer-motion";
import { Plan } from "@/lib/all-types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PlanMutationResult } from "@/hooks/usePlans";
import { PlanFormValues } from "@/validations";
import { useRouter } from "next/navigation";

type TierFilter = "all" | "free" | "pro" | "business" | "enterprise";
type StatusFilter = "all" | "active" | "inactive";
type BillingFilter = "all" | "monthly" | "yearly";

export interface PlansFilters {
  search: string;
  tier: TierFilter;
  status: StatusFilter;
  billing: BillingFilter;
}

type SavePlanFn = (
  mode: "create" | "update",
  values: PlanFormValues,
  id?: string,
) => Promise<PlanMutationResult>;

interface PlansControlBarProps {
  filters: PlansFilters;
  onChange: (updated: Partial<PlansFilters>) => void;
  resultCount?: number;
  savePlan: SavePlanFn;
}

const tierOptions: { value: TierFilter; label: string }[] = [
  { value: "all", label: "All tiers" },
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { value: "business", label: "Business" },
  { value: "enterprise", label: "Enterprise" },
];

const activeFilterCount = (f: PlansFilters) => {
  let count = 0;
  if (f.tier !== "all") count++;
  if (f.status !== "all") count++;
  if (f.billing !== "all") count++;
  return count;
};

export const PlansControlBar = ({
  filters,
  onChange,
  resultCount,
  savePlan,
}: PlansControlBarProps) => {
  const [searchValue, setSearchValue] = useState(filters.search);
  const filtersActive = activeFilterCount(filters);
  const debouncedSearch = useDebounce(searchValue);

  useEffect(() => {
    onChange({ search: debouncedSearch });
  }, [debouncedSearch, onChange]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const clearSearch = () => {
    setSearchValue("");
    onChange({ search: "" });
  };

  const clearAllFilters = () => {
    onChange({ tier: "all", status: "all", billing: "all" });
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 min-w-60 max-w-sm">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search plans..."
                value={searchValue}
                onChange={handleSearchChange}
                className="pl-8 pr-8 text-sm"
              />
              {searchValue && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "text-xs h-9 font-medium",
                    filters.tier !== "all" &&
                      "border-primary/40 bg-primary/5 text-primary",
                  )}
                >
                  Tier
                  {filters.tier !== "all" && (
                    <Badge className="h-4 w-4 rounded-full p-0 text-[9px] flex items-center justify-center">
                      1
                    </Badge>
                  )}
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40">
                <DropdownMenuLabel className="text-xs">Tier</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={filters.tier}
                  onValueChange={(v) => onChange({ tier: v as TierFilter })}
                >
                  {tierOptions.map((opt) => (
                    <DropdownMenuRadioItem
                      key={opt.value}
                      value={opt.value}
                      className="text-xs"
                    >
                      {opt.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "text-xs h-9 font-medium",
                    filters.status !== "all" &&
                      "border-primary/40 bg-primary/5 text-primary",
                  )}
                >
                  Status
                  {filters.status !== "all" && (
                    <Badge className="h-4 w-4 rounded-full p-0 text-[9px] flex items-center justify-center">
                      1
                    </Badge>
                  )}
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-36">
                <DropdownMenuLabel className="text-xs">
                  Status
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={filters.status}
                  onValueChange={(v) => onChange({ status: v as StatusFilter })}
                >
                  {[
                    { value: "all", label: "All" },
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive" },
                  ].map((opt) => (
                    <DropdownMenuRadioItem
                      key={opt.value}
                      value={opt.value}
                      className="text-xs"
                    >
                      {opt.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "text-xs h-9 font-medium",
                    filters.billing !== "all" &&
                      "border-primary/40 bg-primary/5 text-primary",
                  )}
                >
                  Billing
                  {filters.billing !== "all" && (
                    <Badge className="h-4 w-4 rounded-full p-0 text-[9px] flex items-center justify-center">
                      1
                    </Badge>
                  )}
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-36">
                <DropdownMenuLabel className="text-xs">
                  Billing cycle
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={filters.billing}
                  onValueChange={(v) =>
                    onChange({ billing: v as BillingFilter })
                  }
                >
                  {[
                    { value: "all", label: "All" },
                    { value: "monthly", label: "Monthly" },
                    { value: "yearly", label: "Yearly" },
                  ].map((opt) => (
                    <DropdownMenuRadioItem
                      key={opt.value}
                      value={opt.value}
                      className="text-xs"
                    >
                      {opt.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {filtersActive > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={clearAllFilters}
              >
                <X className="size-4" />
                Clear filters
                <Badge
                  variant="secondary"
                  className="ml-0.5 h-4 px-1 text-[9px]"
                >
                  {filtersActive}
                </Badge>
              </Button>
            )}
          </div>

          <PlanDialog
            trigger={
              <Button variant="default" className="gap-1.5 max-w-35 w-full">
                <Plus className="h-3.5 w-3.5" />
                Add plan
              </Button>
            }
            mode="create"
            savePlan={savePlan}
          />
        </div>

        {resultCount !== undefined && (
          <p className="text-xs text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">{resultCount}</span>{" "}
            {resultCount === 1 ? "plan" : "plans"}
            {filtersActive > 0 || filters.search
              ? " matching current filters"
              : ""}
          </p>
        )}
      </div>
    </TooltipProvider>
  );
};

export function SelectedPlanBanner({
  selected,
  onClear,
  remove,
  toggleActive,
  savePlan,
}: {
  selected: Plan;
  remove: (id: string) => Promise<PlanMutationResult>;
  toggleActive: (id: string) => Promise<PlanMutationResult>;
  onClear: () => void;
  savePlan: SavePlanFn;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onRemove = (plan: Plan) => {
    startTransition(async () => {
      if (plan.isActive) {
        setError("Please deactivate this plan before deleting it.");
        return;
      }

      const id = plan.id;
      const res = await remove(id);

      if (!res.success) {
        setError(res.error);
        return;
      }

      onClear();
    });
  };

  const onToggleActive = (id: string) => {
    startTransition(async () => {
      const res = await toggleActive(id);

      if (!res.success) {
        setError(res.error);
        return;
      }

      onClear();
    });
  };

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full border-b sticky backdrop-blur-lg top-17 z-10"
    >
      <div className="flex justify-between px-4 py-3 flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex items-center gap-3">
          {isPending && <Loader className="animate-spin size-4" />}
          <div className="text-sm font-medium">
            1 plan selected :
            <span className="ml-1 text-green-500">{selected.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <PlanDialog
            trigger={
              <Button size="sm" variant="outline" disabled={isPending}>
                <Pencil className="h-3.5 w-3.5 mr-1" />
                Edit
              </Button>
            }
            defaultValues={selected}
            mode="update"
            savePlan={savePlan}
          />

          <Button
            size="sm"
            variant="link"
            onClick={() => router.push(`/admin/subscriptions?${selected.id}`)}
            disabled={isPending}
          >
            <Receipt className="h-3.5 w-3.5" />
            Show subscriptions
          </Button>

          <Button
            size="sm"
            variant="destructive"
            onClick={() => onRemove(selected)}
            disabled={isPending}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Remove
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => onToggleActive(selected.id)}
            disabled={isPending}
          >
            {selected.isActive ? (
              <>
                <Ban className="h-3.5 w-3.5" />
                Disable
              </>
            ) : (
              <>
                <Activity className="h-3.5 w-3.5" />
                Activate
              </>
            )}
          </Button>

          <Button size="sm" variant="ghost" onClick={onClear}>
            Cancel
          </Button>
        </div>
      </div>

      <AlertDialog open={!!error} onOpenChange={() => setError(null)}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-destructive/10 border border-destructive/20">
                <AlertCircle className="size-5 text-destructive" />
              </div>

              <div className="text-left">
                <AlertDialogTitle className="text-lg font-semibold">
                  Something went wrong
                </AlertDialogTitle>
              </div>
            </div>

            {error && (
              <div className="rounded-md border bg-muted/50 px-3 py-2 w-full overflow-hidden">
                <p className="text-sm font-medium text-destructive wrap-break-word whitespace-pre-wrap">
                  {error}
                </p>
              </div>
            )}
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogAction
              className="w-full sm:w-30"
              onClick={() => setError(null)}
            >
              Got it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
