"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, X, Inbox, Trash2 } from "lucide-react";
import { cn, fmtDate } from "@/lib/utils";
import { ActivePlans, SubscriptionRow } from "@/lib/admin-types";
import {
  BusinessType,
  ProviderStatus,
  SubscriptionStatus,
} from "@/lib/all-types";
import { fmtCurrency } from "@/lib/helpers";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  data: SubscriptionRow[];
  total: number;
  page: number;
  totalPages: number;
  activePlans: ActivePlans[];
  filters: {
    status?: SubscriptionStatus;
    planId?: string;
    type?: "trial" | "paid";
  };
}

type StatusBadgeType = SubscriptionStatus | ProviderStatus;

const STATUS_STYLES = {
  // Subscription statuses
  active:
    "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900",
  trialing:
    "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900",
  paused:
    "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900",
  cancelled:
    "bg-red-50 text-red-700 border-red-100 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900",
  expired:
    "bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800/40 dark:text-zinc-400 dark:border-zinc-700",

  // Provider statuses
  pending:
    "bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-900",

  approved:
    "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900",

  inactive:
    "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700",

  suspended:
    "bg-red-50 text-red-700 border-red-100 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900",

  rejected:
    "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900",
} as const;

const BUSINESS_TYPE_STYLES: Record<BusinessType, string> = {
  individual:
    "bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-900",

  company:
    "bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-900",

  agency:
    "bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-900",
};

const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  individual: "Individual",
  company: "Company",
  agency: "Agency",
};

function StatusBadge({ status }: { status: StatusBadgeType }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        STATUS_STYLES[status],
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function TypeBadge({ type }: { type: "trial" | "paid" | null }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        type === "trial"
          ? "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900"
          : "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900",
      )}
    >
      {type ? type.charAt(0).toUpperCase() + type.slice(1) : "N/A"}
    </span>
  );
}

function BusinessTypeBadge({
  type,
  className,
}: {
  type: BusinessType;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        BUSINESS_TYPE_STYLES[type],
        className,
      )}
    >
      {BUSINESS_TYPE_LABELS[type]}
    </span>
  );
}

export function SubscriptionsTable({
  data,
  total,
  page,
  totalPages,
  activePlans,
  filters,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const searchParams = useSearchParams();
  const hasFilters = searchParams.toString().length > 0;

  const pushParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      startTransition(() => {
        const params = new URLSearchParams();
        const merged = {
          ...filters,
          page: "1",
          ...updates,
        };
        Object.entries(merged).forEach(([key, value]) => {
          if (value) {
            params.set(key, value);
          }
        });

        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [filters, pathname, router],
  );

  const resetFilters = useCallback(() => {
    startTransition(() => {
      router.replace(pathname);
    });
  }, [pathname, router, startTransition]);

  const allSelected = data.length > 0 && selectedIds.length === data.length;
  const someSelected = selectedIds.length > 0 && !allSelected;
  const toggleRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id],
    );
  };
  const toggleAll = () => {
    setSelectedIds((prev) =>
      prev.length === data.length ? [] : data.map((row) => row.id),
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select
          defaultValue={filters.status ?? "all"}
          onValueChange={(v) =>
            pushParams({ status: v === "all" ? undefined : v })
          }
        >
          <SelectTrigger className="h-8 w-30 text-sm" disabled={isPending}>
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="trialing">Trialing</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>

        <Select
          defaultValue={filters.planId ?? "all"}
          onValueChange={(v) =>
            pushParams({ planId: v === "all" ? undefined : v })
          }
        >
          <SelectTrigger className="h-8 w-30 text-sm" disabled={isPending}>
            <SelectValue placeholder="All plans" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All plans</SelectItem>
            {activePlans.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          defaultValue={filters.type ?? "all"}
          onValueChange={(v) =>
            pushParams({
              type: v === "all" ? undefined : (v as "trial" | "paid"),
            })
          }
        >
          <SelectTrigger className="h-8 w-27 text-sm" disabled={isPending}>
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="trial">Trial</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-9 text-sm"
            disabled={isPending}
          >
            <Trash2 className="size-4" />
            Reset Filters
          </Button>
        )}

        {total > 0 && (
          <span className="ml-auto text-xs text-muted-foreground">
            {total} result{total !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="rounded-md border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-6 pl-5">
                <Checkbox
                  checked={
                    allSelected ? true : someSelected ? "indeterminate" : false
                  }
                  onCheckedChange={toggleAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="text-xs font-medium w-25">
                Provider
              </TableHead>
              <TableHead className="text-xs font-medium w-20">
                Provider Status
              </TableHead>
              <TableHead className="w-24 text-xs font-medium">
                Business
              </TableHead>
              <TableHead className="text-xs font-medium w-27.5">Plan</TableHead>
              <TableHead className="text-xs font-medium w-25">Status</TableHead>
              <TableHead className="text-xs font-medium w-20">Type</TableHead>
              <TableHead className="text-xs font-medium w-27.5">
                Start date
              </TableHead>
              <TableHead className="text-xs font-medium w-27.5">
                End date
              </TableHead>
              <TableHead className="text-xs font-medium text-center w-20">
                Used Listings
              </TableHead>
              <TableHead className="text-xs font-medium text-center w-22.5">
                Auto-renew
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="h-48 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground transition-all">
                    <Inbox className="h-7 w-7" />
                    <span className="text-sm">
                      No subscriptions match your filters.
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn(
                    "transition-colors duration-200",
                    isPending && "opacity-60",
                    selectedIds.includes(row.id) &&
                      "bg-amber-500/7 hover:bg-amber-500/10",
                  )}
                >
                  <TableCell className="w-6 pl-5">
                    <Checkbox
                      checked={selectedIds.includes(row.id)}
                      onCheckedChange={() => toggleRow(row.id)}
                      aria-label={`Select ${row.provider}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-sm">
                    <p className="text-sm font-medium">{row.provider}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.businessEmail}
                    </p>
                  </TableCell>
                  <TableCell>
                    {row.providerStats ? (
                      <StatusBadge status={row.providerStats} />
                    ) : (
                      <span className="text-xs text-muted-foreground border px-2 py-0.5 rounded-full">
                        Not detected
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <BusinessTypeBadge type={row.businessType} />
                  </TableCell>
                  <TableCell className="text-sm">
                    <span className="text-foreground">{row.planName}</span>
                    <span className="text-xs text-muted-foreground">
                      {fmtCurrency(row.planPrice)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={row.status} />
                  </TableCell>
                  <TableCell>
                    <TypeBadge type={row.type} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {fmtDate(row.startDate)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {fmtDate(row.endDate)}
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">
                    {row.listingsCount}
                  </TableCell>
                  <TableCell className="text-center">
                    {row.autoRenew ? (
                      <Check className="size-4 text-emerald-500 mx-auto" />
                    ) : (
                      <X className="size-4 text-destructive mx-auto" />
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-border/50 bg-muted/20">
            <span className="text-xs text-muted-foreground">
              Page {page} of {totalPages} · {total} total
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                disabled={page <= 1}
                onClick={() => pushParams({ page: String(page - 1) })}
              >
                Previous
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = i + Math.max(1, page - 2);
                if (p > totalPages) return null;
                return (
                  <Button
                    key={p}
                    variant={p === page ? "default" : "outline"}
                    size="sm"
                    className="h-7 w-7 text-xs"
                    onClick={() => pushParams({ page: String(p) })}
                  >
                    {p}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                disabled={page >= totalPages}
                onClick={() => pushParams({ page: String(page + 1) })}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
