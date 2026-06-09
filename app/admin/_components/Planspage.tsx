"use client";

import { useCallback, useMemo, useState } from "react";
import { AlertCircle, LayoutGrid, PackageX, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import PlansControlBar, { PlansFilters } from "./Planscontrolbar";
import { Plan } from "@/lib/all-types";

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

const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
      <AlertCircle className="h-5 w-5 text-destructive" />
    </div>
    <div>
      <p className="text-sm font-medium text-foreground">
        Failed to load plans
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">
        Something went wrong while fetching plans.
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
  const [loading, setloading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [filters, setFilters] = useState<PlansFilters>(defaultFilters);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const handleFilterChange = useCallback((updated: Partial<PlansFilters>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  }, []);

  const clearAllFilters = () => {
    setFilters(defaultFilters);
  };

  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
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

      return matchesSearch && matchesTier && matchesStatus && matchesBilling;
    });
  }, [plans, filters]);

  const hasActiveFilters =
    filters.search ||
    filters.tier !== "all" ||
    filters.status !== "all" ||
    filters.billing !== "all";

  const totalPlans = plans.length;
  const activePlans = plans.filter((plan) => plan.isActive).length;

  return (
    <div className="space-y-5 px-4 py-6 md:px-6 w-full">
      <PlansPageHeader totalPlans={totalPlans} activePlans={activePlans} />

      <PlansControlBar
        filters={filters}
        onChange={handleFilterChange}
        resultCount={loading ? undefined : filteredPlans.length}
      />

      {error ? (
        <ErrorState
          onRetry={() => {
            setError(null);
            setRetryKey((k) => k + 1);
          }}
        />
      ) : loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* will add skelton or loader later */}
        </div>
      ) : plans.length === 0 ? (
        <EmptyState
          hasFilters={Boolean(hasActiveFilters)}
          onClear={clearAllFilters}
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Will put the plans card here later */}
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
