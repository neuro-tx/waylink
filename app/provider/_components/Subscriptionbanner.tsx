"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  LayoutList,
  CalendarClock,
  PauseCircle,
} from "lucide-react";
import { cn, fmtDate } from "@/lib/utils";
import type { Subscription, SubscriptionStatus } from "@/lib/all-types";
import Link from "next/link";

interface SubscriptionBannerProps {
  subscription: Subscription | null;
}

const STATUS_CONFIG: Record<
  SubscriptionStatus,
  {
    icon: any;
    label: string;
    cls: string;
    badgeCls: string;
  }
> = {
  trialing: {
    icon: Clock,
    label: "Trial active",
    cls: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-200",
    badgeCls: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  },
  active: {
    icon: CheckCircle2,
    label: "Active",
    cls: "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200",
    badgeCls:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  },
  cancelled: {
    icon: XCircle,
    label: "Cancelled",
    cls: "bg-muted border-border text-muted-foreground",
    badgeCls: "bg-muted text-muted-foreground",
  },
  expired: {
    icon: AlertTriangle,
    label: "Expired",
    cls: "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-800 dark:text-red-200",
    badgeCls: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  },
  paused: {
    icon: PauseCircle,
    label: "Paused",
    cls: "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200",
    badgeCls:
      "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  },
};

function daysUntil(d: Date | string) {
  const diff = new Date(d).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function SubscriptionBanner({ subscription }: SubscriptionBannerProps) {
  if (!subscription) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 px-4 py-3.5 mb-8">
        <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            No active plan
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
            Your account is approved. Choose a plan below to start creating
            service listings and accepting bookings — a free trial may be
            available depending on the plan.
          </p>
        </div>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[subscription.status];
  const Icon = cfg.icon;
  const maxListings = subscription.plan?.maxListings;
  const listingsUsed = subscription.listingsCount;
  const listingsPct = maxListings
    ? Math.round((listingsUsed / maxListings) * 100)
    : 0;
  const trialDaysLeft =
    subscription.status === "trialing" ? daysUntil(subscription.endDate) : null;

  const progressColor = {
    normal: "[&>div]:bg-emerald-500",
    warning: "[&>div]:bg-amber-500",
    danger: "[&>div]:bg-red-500",
  };

  const usageState =
    listingsPct >= 90 ? "danger" : listingsPct >= 70 ? "warning" : "normal";

  return (
    <div
      className={cn(
        "rounded-xl border px-5 py-4 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 items-center",
        cfg.cls,
      )}
    >
      <div className="flex items-center gap-3">
        <Icon className="size-5 shrink-0" />
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-medium">
              {subscription.plan?.name ?? "Plan"} plan
            </span>
            <Badge
              className={cn("text-[10px] h-4 px-1.5 border-0", cfg.badgeCls)}
            >
              {cfg.label}
            </Badge>
          </div>
          {subscription.status === "trialing" && trialDaysLeft !== null && (
            <p className="text-xs opacity-80">
              <CalendarClock className="inline size-3 mr-1 mb-0.5" />
              Trial ends{" "}
              {trialDaysLeft === 0
                ? "today"
                : `in ${trialDaysLeft} day${trialDaysLeft !== 1 ? "s" : ""}`}{" "}
              · {fmtDate(subscription.endDate!)}
            </p>
          )}
          {subscription.status === "active" && (
            <p className="text-xs opacity-80">
              Renews {fmtDate(subscription.endDate)}
              {!subscription.autoRenew && " · Cancels at period end"}
            </p>
          )}
          {subscription.status === "cancelled" && subscription.endDate && (
            <p className="text-xs opacity-80">
              Access until {fmtDate(subscription.endDate)}
            </p>
          )}
          {subscription.status === "expired" && (
            <p className="text-xs opacity-80">
              Expired {fmtDate(subscription.endDate)}. Renew to restore access.
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <LayoutList className="size-4 shrink-0 opacity-70" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium">Listings used</span>
            <span className="text-xs opacity-80">
              {listingsUsed} / {maxListings ?? "∞"}
            </span>
          </div>
          {maxListings ? (
            <Progress
              value={listingsPct}
              className={cn("h-1.5", progressColor[usageState])}
            />
          ) : (
            <div className="h-1.5 rounded-full bg-current opacity-20" />
          )}
        </div>
      </div>

      <div className="flex justify-end">
        {(subscription.status === "expired" ||
          subscription.status === "cancelled") && (
          <p className="text-xs opacity-70 text-right">
            Your subscription is no longer active.
            <br />
            <Link
              href="/provider/subscription"
              className="font-medium underline underline-offset-2 hover:text-foreground transition-colors"
            >
              View subscription details
            </Link>
          </p>
        )}
        {subscription.status === "trialing" && (
          <p className="text-xs opacity-70 text-right">
            Upgrade below for more listings
            <br /> and higher search priority.
          </p>
        )}

        {subscription.status === "active" && (
          <p className="text-xs opacity-70 text-right">
            Your subscription is active and optimized for your usage.
            <br />
            You can fine-tune or upgrade it anytime below.
          </p>
        )}

        {subscription.status === "paused" && (
          <p className="text-xs opacity-70 text-right">
            Your subscription is currently paused.
            <br />
            <Link
              href="/provider/subscription"
              className="font-medium underline underline-offset-2 hover:text-foreground transition-colors"
            >
              Manage or resume it here
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
