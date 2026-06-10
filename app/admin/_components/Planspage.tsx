"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  LayoutGrid,
  Loader,
  PackageX,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PlansControlBar,
  PlansFilters,
  SelectedPlanBanner,
} from "./Planscontrolbar";
import { Plan } from "@/lib/all-types";
import { getAllPlans } from "@/actions/plans.action";
import { PlanCard } from "@/app/provider/_components/Plansclient";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "success" | "error";

const EmptyState = ({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean;
  onClear: () => void;
}) => (
  <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
      <PackageX className="h-5 w-5 text-muted-foreground" />
    </div>
    <div>
      <p className="text-sm font-medium text-foreground">No plans found</p>
      <p className="text-xs text-muted-foreground mt-0.5">
        {hasFilters
          ? "Try adjusting your filters or search query."
          : "Create your first plan to get started."}
      </p>
    </div>
    {hasFilters && (
      <Button variant="outline" size="sm" className="text-xs" onClick={onClear}>
        Clear filters
      </Button>
    )}
  </div>
);

const ErrorState = ({
  onRetry,
  error,
}: {
  error: string;
  onRetry: () => void;
}) => (
  <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
      <AlertCircle className="h-5 w-5 text-destructive" />
    </div>
    <div>
      <p className="text-sm font-medium text-foreground">
        Failed to load plans
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">
        {error || "Something went wrong while fetching plans."}
      </p>
    </div>
    <Button variant="outline" size="sm" className="text-xs" onClick={onRetry}>
      Try again
    </Button>
  </div>
);

const defaultFilters: PlansFilters = {
  search: "",
  tier: "all",
  status: "all",
  billing: "all",
};

const PlansPage = () => {
  const [status, setStatus] = useState<Status>("loading");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [filters, setFilters] = useState<PlansFilters>(defaultFilters);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<{ id: string; name: string } | null>(
    null,
  );

  const fetchPlans = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      const res = await getAllPlans();
      const data = Array.isArray(res) ? res : [res];

      setPlans(data ?? []);
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const computed = useMemo(() => {
    let active = 0;

    const filtered = plans.filter((plan) => {
      const matchesSearch =
        !filters.search ||
        plan.name.toLowerCase().includes(filters.search.toLowerCase());

      const matchesTier = filters.tier === "all" || plan.tier === filters.tier;

      const matchesStatus =
        filters.status === "all" ||
        (filters.status === "active" && plan.isActive) ||
        (filters.status === "inactive" && !plan.isActive);

      const matchesBilling =
        filters.billing === "all" || plan.billingCycle === filters.billing;

      const match =
        matchesSearch && matchesTier && matchesStatus && matchesBilling;

      if (plan.isActive) active++;

      return match;
    });

    return {
      filtered,
      active,
      total: plans.length,
    };
  }, [plans, filters]);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.search ||
      filters.tier !== "all" ||
      filters.status !== "all" ||
      filters.billing !== "all"
    );
  }, [filters]);

  const handleFilterChange = useCallback((updated: Partial<PlansFilters>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleSelect = (
    e: React.MouseEvent,
    plan: { id: string; name: string },
  ) => {
    if (e.ctrlKey || e.metaKey) {
      setSelected((prev) => (prev?.id === plan.id ? null : plan));

      e.preventDefault();
      e.stopPropagation();
    }
  };

  if (status === "loading")
    return (
      <div className="w-full h-[calc(100dvh-100px)] p-4 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader className="w-5 h-5 animate-spin" />
          <p className="text-muted-foreground font-mono font-medium">
            Loading ...
          </p>
        </div>
      </div>
    );

  return (
    <div className="space-y-5 px-4 py-6 md:px-6 w-full">
      <PlansPageHeader
        totalPlans={computed.total}
        activePlans={computed.active}
      />

      <PlansControlBar
        filters={filters}
        onChange={handleFilterChange}
        resultCount={computed.filtered.length}
      />

      <SelectedPlanBanner
        selected={selected}
        onClear={() => setSelected(null)}
        onSuccess={(plans) => {}}
      />

      {status === "error" ? (
        <ErrorState error={error || ""} onRetry={fetchPlans} />
      ) : computed.filtered.length === 0 ? (
        <EmptyState
          hasFilters={Boolean(hasActiveFilters)}
          onClear={clearAllFilters}
        />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3  2xl:grid-cols-4 gap-4">
          {computed.filtered.map((plan) => {
            const isSelected = selected?.id === plan.id;

            return (
              <div
                onClick={(e) =>
                  handleSelect(e, {
                    id: plan.id,
                    name: plan.name,
                  })
                }
                key={plan.id}
                className={cn(
                  "relative h-full",
                  isSelected && "ring-2 ring-primary rounded-xl",
                )}
              >
                {isSelected && (
                  <span className="absolute top-4 right-4 size-6 rounded-full bg-foreground text-background z-10 grid place-items-center">
                    <Check className="size-4" />
                  </span>
                )}

                <PlanCard
                  plan={plan}
                  billingCycle={plan.billingCycle}
                  isCurrent={false}
                  onSelect={() => {}}
                  disabledActions
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const PlansPageHeader = ({
  totalPlans,
  activePlans,
}: {
  totalPlans?: number;
  activePlans?: number;
}) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Plans Manager</h1>
        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed max-w-xl">
          Configure plan availability, billing cycles, feature access, and trial
          options for providers using the platform.
        </p>
      </div>

      <div className="flex items-center gap-2">
        {totalPlans !== undefined && (
          <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <LayoutGrid className="h-3 w-3" />
            <span>
              <span className="font-medium text-foreground mr-1">
                {totalPlans}
              </span>{" "}
              Total
            </span>
          </div>
        )}
        {activePlans !== undefined && (
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="h-3 w-3" />
            <span>
              <span className="font-semibold">{activePlans}</span> Active
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlansPage;
