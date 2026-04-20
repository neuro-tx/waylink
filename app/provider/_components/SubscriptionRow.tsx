"use client";

import { cn, fmtDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Zap,
  Star,
  Building2,
  Gift,
  PauseCircle,
} from "lucide-react";
import type {
  Subscription,
  SubscriptionStatus,
  PlanTier,
} from "@/lib/all-types";


export const STATUS_CONFIG: Record<
  SubscriptionStatus,
  {
    label: string;
    icon: React.ElementType;
    badgeCls: string;
    rowActiveCls: string;
  }
> = {
  active: {
    label: "Active",
    icon: CheckCircle2,
    badgeCls:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
    rowActiveCls: "border-l-emerald-500",
  },
  trialing: {
    label: "Trial",
    icon: Clock,
    badgeCls:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
    rowActiveCls: "border-l-blue-500",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    badgeCls: "bg-muted text-muted-foreground border-border",
    rowActiveCls: "border-l-border",
  },
  expired: {
    label: "Expired",
    icon: AlertTriangle,
    badgeCls:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800",
    rowActiveCls: "border-l-red-400",
  },
  paused: {
    label: "Paused",
    icon: PauseCircle,
    badgeCls:
      "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    rowActiveCls: "amber-l-red-400",
  },
};

export const TIER_CONFIG: Record<
  PlanTier,
  { icon: React.ElementType; iconCls: string }
> = {
  free: { icon: Gift, iconCls: "text-muted-foreground" },
  pro: { icon: Zap, iconCls: "text-blue-500" },
  business: { icon: Star, iconCls: "text-amber-500" },
  enterprise: { icon: Building2, iconCls: "text-foreground" },
};

export function daysUntil(d: Date | string): number {
  return Math.max(
    0,
    Math.ceil((new Date(d).getTime() - Date.now()) / 86_400_000),
  );
}

export function daysSince(d: Date | string): number {
  return Math.max(
    0,
    Math.ceil((Date.now() - new Date(d).getTime()) / 86_400_000),
  );
}

interface SubscriptionRowProps {
  subscription: Subscription;
  isSelected: boolean;
  onClick: () => void;
}

export function SubscriptionRow({
  subscription,
  isSelected,
  onClick,
}: SubscriptionRowProps) {
  const status = STATUS_CONFIG[subscription.status];
  const tier = subscription.plan?.tier ?? "free";
  const tierCfg = TIER_CONFIG[tier as PlanTier] ?? TIER_CONFIG.free;
  const TierIcon = tierCfg.icon;

  const isLive =
    subscription.status === "active" || subscription.status === "trialing";

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-3.5 border-l-2 transition-all duration-150",
        "hover:bg-muted/40 focus-visible:outline-none focus-visible:bg-muted/40 group",
        isSelected
          ? cn("bg-muted/60", status.rowActiveCls)
          : "border-l-transparent",
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <TierIcon className={cn("size-4 shrink-0", tierCfg.iconCls)} />
          <span className="text-sm font-medium truncate">
            {subscription.plan?.name ?? "Unknown plan"}
          </span>
        </div>

        <Badge variant="outline" className={status.badgeCls}>
          {status.label}
        </Badge>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {subscription.plan?.billingCycle ?? "—"} ·{" "}
          {isLive ? (
            <>
              {subscription.status === "trialing"
                ? `Trial ends ${fmtDate(subscription.endDate)}`
                : `Renews ${fmtDate(subscription.endDate)}`}
            </>
          ) : (
            <>Ended {fmtDate(subscription.endDate)}</>
          )}
        </span>
      </div>
    </button>
  );
}

