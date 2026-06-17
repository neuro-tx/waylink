"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Ban,
  BookUser,
  ChevronDown,
  Clock3,
  Eye,
  PauseCircle,
  PlayCircle,
  SquarePen,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  BadgeCheck,
  Layers,
  RefreshCw,
} from "lucide-react";
import React, { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Plan, PlanTier } from "@/lib/all-types";
import { SubscriptionStatus } from "@/lib/all-types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getPlanById, handleSubscriptions } from "@/actions/plans.action";
import {
  SubscriptionActionResultDialog,
  SubscriptionActionResultState,
} from "./SubscriptionActionResultDialog";

interface StatusOption {
  action: SubscriptionAction;
  targetStatus: SubscriptionStatus;
  label: string;
  icon: React.ReactNode;
  destructive?: boolean;
  description: string;
}

export interface SelectedModelProps {
  subscriptionId: string;
  providerId: string;
  planId: string;
  status: SubscriptionStatus;
  planName: string;
}

interface BarProps {
  selected: SelectedModelProps[];
  clearFilter: () => void;
}

type Status = "idle" | "loading" | "success" | "error";

type SubscriptionAction = "cancel" | "expire" | "pause" | "resume";
const transitions: Record<SubscriptionStatus, SubscriptionAction[]> = {
  active: ["cancel", "pause"],
  cancelled: [],
  expired: [],
  paused: ["resume", "cancel", "expire"],
  trialing: ["cancel", "expire"],
};

function Portal({ children }: { children: React.ReactNode }) {
  return createPortal(children, document.body);
}

function Sep({ className }: { className?: string }) {
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      aria-hidden="true"
      className={cn("bg-border h-6 w-px", className)}
    />
  );
}

const STATUS_OPTIONS: StatusOption[] = [
  {
    action: "pause",
    targetStatus: "paused",
    label: "Pause",
    icon: <PauseCircle className="size-4 text-amber-500" />,
    description: "Pause the subscription.",
  },
  {
    action: "resume",
    targetStatus: "active",
    label: "Resume",
    icon: <PlayCircle className="size-4 text-emerald-500" />,
    description: "Reactivate the subscription.",
  },
  {
    action: "expire",
    targetStatus: "expired",
    label: "Expire",
    icon: <Clock3 className="size-4 text-zinc-400" />,
    description: "Mark as expired.",
  },
  {
    action: "cancel",
    targetStatus: "cancelled",
    label: "Cancel",
    destructive: true,
    icon: <Ban className="size-4 text-destructive" />,
    description: "Cancel immediately.",
  },
];

const TIER_COLORS: Record<PlanTier, string> = {
  free: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  business:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  pro: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400",
  enterprise:
    "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
};

function TierBadge({ tier }: { tier: PlanTier }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
        TIER_COLORS[tier],
      )}
    >
      {tier}
    </span>
  );
}

function PlanRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground text-right">{value}</span>
    </div>
  );
}

const SubscriptionActionsBar = ({ selected, clearFilter }: BarProps) => {
  const router = useRouter();
  if (!selected || selected.length === 0) return null;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [pendingStatus, setPendingStatus] = useState<StatusOption | null>(null);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [planStatus, setPlanStatus] = useState<Status>("idle");
  const [actionResult, setActionResult] =
    useState<SubscriptionActionResultState | null>(null);

  function handleStatusSelect(option: StatusOption) {
    setError(null);
    setSuccessMsg(null);
    setPendingStatus(option);
  }

  function handleStatusConfirm() {
    if (!pendingStatus || !selected?.length) return;

    startTransition(async () => {
      setError(null);
      setSuccessMsg(null);
      try {
        const ids = selected.map((s) => s.subscriptionId);
        const result = await handleSubscriptions(
          ids,
          pendingStatus.targetStatus,
        );

        setActionResult({
          result: result as any,
          totalSubmitted: ids.length,
          targetStatus: pendingStatus.targetStatus,
          targetLabel: pendingStatus.label,
        });

        if (result.success) {
          router.push(
            `/admin/subscriptions?status=${pendingStatus.targetStatus}`,
          );
        }

        setPendingStatus(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update status.",
        );
        setPendingStatus(null);
      }
    });
  }

  useEffect(() => {
    if (!planDialogOpen || selected.length !== 1 || !selected[0].planId) {
      return;
    }

    let cancelled = false;
    const loadPlan = async () => {
      setPlanStatus("loading");
      setError(null);

      const res = await getPlanById(selected[0].planId);
      if (cancelled) return;
      if (!res.success) {
        setError(res.error ?? "Failed to load plan.");
        setPlanStatus("error");
        return;
      }

      setPlan(res.data ?? null);
      setPlanStatus("success");
    };

    void loadPlan();
    return () => {
      cancelled = true;
    };
  }, [planDialogOpen, selected]);

  const planUrl = `/admin/plans?search=${selected[0].planName}`;
  const providerUrl = `/admin/provider_management/${selected[0].providerId}`;
  const disable = selected.length > 1 || isPending;

  const availableActions: SubscriptionAction[] =
    selected.length === 0
      ? []
      : selected
          .map((sub) => transitions[sub.status] ?? [])
          .reduce<SubscriptionAction[]>((acc, actions, index) => {
            if (index === 0) return actions;
            return acc.filter((action) => actions.includes(action));
          }, []);

  const availableOptions = STATUS_OPTIONS.filter((option) =>
    availableActions.includes(option.action),
  );

  return (
    <Portal>
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 animate-in fade-in-0 zoom-in-95 duration-200 [animation-timing-function:cubic-bezier(0.16,1,0.3,1)]">
        <div className="w-fit border border-border px-3 py-2 rounded-md bg-card shadow-lg shadow-black/10 dark:shadow-black/30">
          {(error || successMsg) && (
            <div
              className={cn(
                "my-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
                error
                  ? "bg-destructive/8 text-destructive border border-destructive/20"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900",
              )}
            >
              {error ? (
                <>
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{error}</span>
                  <button
                    className="ml-auto flex items-center gap-1 underline-offset-2 hover:underline"
                    onClick={() => setError(null)}
                  >
                    <RefreshCw className="size-3" />
                    Dismiss
                  </button>
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-3.5 shrink-0" />
                  <span>{successMsg}</span>
                  <button
                    className="ml-auto flex items-center justify-center bg-accent size-6 rounded-full"
                    onClick={() => setSuccessMsg(null)}
                  >
                    <X className="size-4" />
                  </button>
                </>
              )}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="font-medium text-sm gap-2"
              onClick={clearFilter}
              disabled={isPending}
            >
              <span className="tabular-nums">{selected.length} selected</span>
              <Sep className="h-3.5" />
              <X className="size-3.5" />
            </Button>

            <Sep />

            <Button
              variant="ghost"
              size="sm"
              disabled={disable || !selected[0].planId}
              onClick={() => setPlanDialogOpen(true)}
            >
              <Eye className="size-4" />
              Show Plan
            </Button>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={disable}
                  onClick={() => router.push(planUrl)}
                >
                  <SquarePen className="size-4" />
                  Edit Plan
                </Button>
              </TooltipTrigger>

              <TooltipContent side="top">
                <p className="font-mono text-xs break-all">{planUrl}</p>
              </TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <DropdownMenuTrigger asChild disabled={isPending}>
                <Button variant="outline" size="sm">
                  {isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ChevronDown className="size-4" />
                  )}
                  Change Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-44">
                {availableOptions.length > 0 ? (
                  availableOptions.map((opt) =>
                    opt.destructive ? (
                      <React.Fragment key={opt.action}>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive bg-destructive/5 focus:bg-destructive/10 dark:bg-destructive/10 dark:focus:bg-destructive/20"
                          onClick={() => handleStatusSelect(opt)}
                        >
                          {opt.icon}
                          {opt.label}
                        </DropdownMenuItem>
                      </React.Fragment>
                    ) : (
                      <DropdownMenuItem
                        key={opt.action}
                        onClick={() => handleStatusSelect(opt)}
                      >
                        {opt.icon}
                        {opt.label}
                      </DropdownMenuItem>
                    ),
                  )
                ) : (
                  <DropdownMenuItem disabled>
                    No available actions
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={disable}
                  onClick={() => router.push(providerUrl)}
                >
                  <BookUser className="size-4" />
                  Provider
                </Button>
              </TooltipTrigger>

              <TooltipContent side="top">
                <p className="font-mono text-xs break-all">{providerUrl}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      <Dialog
        open={!!pendingStatus}
        onOpenChange={(open) => !open && setPendingStatus(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {pendingStatus?.icon}
              Set to "{pendingStatus?.label}"
            </DialogTitle>
            <DialogDescription className="pt-1">
              {pendingStatus?.description}{" "}
              <span className="font-medium text-foreground">
                {selected.length} subscription
                {selected.length > 1 ? "s" : ""}
              </span>{" "}
              will be affected.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setPendingStatus(null)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant={pendingStatus?.destructive ? "destructive" : "default"}
              onClick={handleStatusConfirm}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Updating…
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" />
                  Confirm
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={planDialogOpen}
        onOpenChange={(open) => {
          setPlanDialogOpen(open);

          if (!open) {
            setPlan(null);
            setPlanStatus("idle");
            setError(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="size-4 text-muted-foreground" />
              Plan details
            </DialogTitle>
            <DialogDescription>
              Full details for the plan assigned to the selected subscriptions.
            </DialogDescription>
          </DialogHeader>

          {planStatus === "loading" ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Loading plan details...
              </p>
            </div>
          ) : planStatus === "error" ? (
            <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <AlertCircle className="size-5 shrink-0 text-destructive" />

              <div>
                <p className="font-medium text-destructive">
                  Failed to load plan
                </p>

                <p className="text-sm text-muted-foreground">
                  {error ?? "Something went wrong."}
                </p>
              </div>
            </div>
          ) : !plan ? (
            <div className="flex items-center gap-2 rounded-lg border border-border px-4 py-3 text-sm text-muted-foreground">
              <AlertCircle className="size-4 shrink-0" />
              No plan data available.
            </div>
          ) : (
            <div className="space-y-0.5">
              <div className="flex items-center justify-between pb-2">
                <span className="font-semibold text-base text-foreground">
                  {plan.name}
                </span>
                <TierBadge tier={plan.tier} />
              </div>

              <Separator />

              <PlanRow
                label="Price"
                value={
                  plan.isFree ? (
                    <span className="text-emerald-600 dark:text-emerald-400">
                      Free
                    </span>
                  ) : (
                    `$${Number(plan.price).toLocaleString()} / ${plan.billingCycle}`
                  )
                }
              />
              <PlanRow
                label="Commission rate"
                value={`${plan.commissionRate}%`}
              />
              <PlanRow
                label="Max listings"
                value={plan.maxListings ?? "Unlimited"}
              />

              <Separator />

              <PlanRow
                label="Featured in search"
                value={
                  plan.featuredInSearch ? (
                    <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                      <BadgeCheck className="size-3.5" /> Yes
                    </span>
                  ) : (
                    <span className="text-muted-foreground">No</span>
                  )
                }
              />
              <PlanRow
                label="Priority boost"
                value={<span className="capitalize">{plan.priorityBoost}</span>}
              />
              {plan.badgeLabel && (
                <PlanRow
                  label="Badge"
                  value={<Badge variant="secondary">{plan.badgeLabel}</Badge>}
                />
              )}

              <Separator />

              <PlanRow
                label="Trial enabled"
                value={
                  plan.trialEnabled ? (
                    <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                      <CheckCircle2 className="size-3.5" />
                      {plan.trialDays} days
                    </span>
                  ) : (
                    <span className="text-destructive font-medium">
                      No trial
                    </span>
                  )
                }
              />

              <Separator />

              <PlanRow
                label="Status"
                value={
                  plan.isActive ? (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="size-3.5" /> Active
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Inactive</span>
                  )
                }
              />

              {plan.highlights && plan.highlights.length > 0 && (
                <>
                  <Separator />
                  <div className="pt-1">
                    <p className="text-xs text-muted-foreground mb-2">
                      Highlights
                    </p>
                    <ul className="space-y-1">
                      {plan.highlights.map((h, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-1.5 text-sm text-foreground"
                        >
                          <CheckCircle2 className="size-3.5 mt-0.5 shrink-0 text-emerald-500" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              {plan.description && (
                <>
                  <Separator />
                  <p className="text-xs text-muted-foreground pt-1">
                    {plan.description}
                  </p>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <SubscriptionActionResultDialog
        state={actionResult}
        onClose={() => {
          setActionResult(null);
          clearFilter();
        }}
      />
    </Portal>
  );
};

export default SubscriptionActionsBar;
