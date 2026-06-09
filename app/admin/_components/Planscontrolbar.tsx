"use client";

import React, { useState } from "react";
import { Search, X, ChevronDown, Plus } from "lucide-react";
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

type TierFilter = "all" | "free" | "pro" | "business" | "enterprise";
type StatusFilter = "all" | "active" | "inactive";
type BillingFilter = "all" | "monthly" | "yearly";

export interface PlansFilters {
  search: string;
  tier: TierFilter;
  status: StatusFilter;
  billing: BillingFilter;
}

interface PlansControlBarProps {
  filters: PlansFilters;
  onChange: (updated: Partial<PlansFilters>) => void;
  resultCount?: number;
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

const PlansControlBar = ({
  filters,
  onChange,
  resultCount,
}: PlansControlBarProps) => {
  const [searchValue, setSearchValue] = useState(filters.search);
  const filtersActive = activeFilterCount(filters);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    onChange({ search: e.target.value });
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
                  size="sm"
                  className={cn(
                    "text-xs font-medium",
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
                  size="sm"
                  className={cn(
                    "text-xs font-medium",
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
                  size="sm"
                  className={cn(
                    "text-xs font-medium",
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

export default PlansControlBar;
