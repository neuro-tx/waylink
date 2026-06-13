"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback, useTransition, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, Check, X, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { SubscriptionRow } from "@/lib/admin-types";
import { SubscriptionStatus } from "@/lib/all-types";
import { useDebounce } from "@/hooks/useDebounce";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActivePlan {
  id: string;
  name: string;
  tier: string;
  price: string;
  billingCycle: string;
}

interface Props {
  data: SubscriptionRow[];
  total: number;
  page: number;
  totalPages: number;
  activePlans: ActivePlan[];
  filters: {
    search?: string;
    status?: SubscriptionStatus;
    planId?: string;
    type?: "trial" | "paid";
  };
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<SubscriptionStatus, string> = {
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
};

function StatusBadge({ status }: { status: SubscriptionStatus }) {
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

// ─── Main component ───────────────────────────────────────────────────────────

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

  // Modal state
  const [changePlanRow, setChangePlanRow] = useState<SubscriptionRow | null>(
    null,
  );
  const [cancelRow, setCancelRow] = useState<SubscriptionRow | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // URL-based filter helpers
  const pushParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams();
      const merged = { ...filters, page: "1", ...updates };
      for (const [k, v] of Object.entries(merged)) {
        if (v) params.set(k, v);
      }
      // startTransition(() => router.push(`${pathname}?${params.toString()}`));
    },
    [filters, pathname, router],
  );

  const handleSearch = useDebounce((val: string) => {
    pushParams({ search: val || undefined });
  }, 300);

  // Actions
  async function handleChangePlan() {
    if (!changePlanRow || !selectedPlanId) return;
    setIsSubmitting(true);
    // await changePlanAction(changePlanRow.id, selectedPlanId);
    setIsSubmitting(false);
    setChangePlanRow(null);
  }

  async function handleCancel() {
    if (!cancelRow) return;
    setIsSubmitting(true);
    // await cancelSubscriptionAction(cancelRow.id);
    setIsSubmitting(false);
    setCancelRow(null);
  }

  function openChangePlan(row: SubscriptionRow) {
    setSelectedPlanId(row.planId);
    setChangePlanRow(row);
  }

  const canCancel = (s: SubscriptionStatus) =>
    s !== "cancelled" && s !== "expired";

  return (
    <>
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-50">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            defaultValue={filters.search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by provider or plan…"
            className="pl-8 h-8 text-sm"
          />
        </div>

        <Select
          defaultValue={filters.status ?? "all"}
          onValueChange={(v) =>
            pushParams({ status: v === "all" ? undefined : v })
          }
        >
          <SelectTrigger className="h-8 w-35 text-sm">
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
          <SelectTrigger className="h-8 w-32.5 text-sm">
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
          <SelectTrigger className="h-8 w-27.5 text-sm">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="trial">Trial</SelectItem>
          </SelectContent>
        </Select>

        {total > 0 && (
          <span className="ml-auto text-xs text-muted-foreground">
            {total} result{total !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border mt-5 border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-xs font-medium w-40">
                Provider
              </TableHead>
              <TableHead className="text-xs font-medium w-27.5">
                Plan
              </TableHead>
              <TableHead className="text-xs font-medium w-25">
                Status
              </TableHead>
              <TableHead className="text-xs font-medium w-20">
                Type
              </TableHead>
              <TableHead className="text-xs font-medium w-27.5">
                Start date
              </TableHead>
              <TableHead className="text-xs font-medium w-27.5">
                End date
              </TableHead>
              <TableHead className="text-xs font-medium text-center w-20">
                Listings
              </TableHead>
              <TableHead className="text-xs font-medium text-center w-22.5">
                Auto-renew
              </TableHead>
              <TableHead className="text-xs font-medium w-12.5" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-48 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Inbox className="h-7 w-7 opacity-40" />
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
                  className={cn(isPending && "opacity-60")}
                >
                  <TableCell className="font-medium text-sm">
                    {row.providerId}
                  </TableCell>
                  <TableCell className="text-sm">
                    <span className="text-foreground">{row.planName}</span>
                    <span className="ml-1 text-xs text-muted-foreground">
                      ${Number(row.planPrice).toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={row.status} />
                  </TableCell>
                  <TableCell>
                    <TypeBadge type={row.type} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {row.startDate.toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {row.endDate.toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">
                    {row.listingsCount}
                  </TableCell>
                  <TableCell className="text-center">
                    {row.autoRenew ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500 mx-auto" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-muted-foreground/50 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                          <span className="sr-only">Row actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 text-sm">
                        <DropdownMenuItem onClick={() => openChangePlan(row)}>
                          Change plan
                        </DropdownMenuItem>
                        {canCancel(row.status) && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setCancelRow(row)}
                            >
                              Cancel subscription
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-border/50 bg-muted/20">
            <span className="text-xs text-muted-foreground">
              Page {page} of {totalPages} · {total} total
            </span>
            <div className="flex items-center gap-1">
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
                    className="h-7 w-7 text-xs p-0"
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

      {/* Change plan dialog */}
      <Dialog
        open={!!changePlanRow}
        onOpenChange={(o) => !o && setChangePlanRow(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Change plan</DialogTitle>
            <DialogDescription>
              Select a new plan for provider{" "}
              <span className="font-medium text-foreground">
                {changePlanRow?.providerId}
              </span>{" "}
              (currently on{" "}
              <span className="font-medium text-foreground">
                {changePlanRow?.planName}
              </span>
              ).
            </DialogDescription>
          </DialogHeader>
          <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
            <SelectTrigger>
              <SelectValue placeholder="Pick a plan" />
            </SelectTrigger>
            <SelectContent>
              {activePlans.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  <span className="flex items-center justify-between w-full gap-4">
                    <span>{p.name}</span>
                    <span className="text-muted-foreground text-xs">
                      ${Number(p.price).toLocaleString()}/{p.billingCycle}
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangePlanRow(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleChangePlan}
              disabled={
                isSubmitting || selectedPlanId === changePlanRow?.planId
              }
            >
              {isSubmitting ? "Saving…" : "Confirm change"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel dialog */}
      <Dialog open={!!cancelRow} onOpenChange={(o) => !o && setCancelRow(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Cancel subscription</DialogTitle>
            <DialogDescription>
              This will cancel{" "}
              <span className="font-medium text-foreground">
                {cancelRow?.providerId}
              </span>
              's subscription. They'll lose access at the end of their current
              billing period. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelRow(null)}>
              Keep subscription
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Cancelling…" : "Yes, cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
