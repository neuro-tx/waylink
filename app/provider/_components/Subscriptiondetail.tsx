"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  XCircle,
  CalendarDays,
  LayoutList,
  Percent,
  TrendingUp,
  Clock,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { cn, fmtDate } from "@/lib/utils";
import {
  STATUS_CONFIG,
  TIER_CONFIG,
  daysUntil,
  daysSince,
} from "./SubscriptionRow";
import type { Subscription, PlanTier } from "@/lib/all-types";
import { SubscriptionActions } from "./Subscriptionactions";

function DetailRow({
  icon: Icon,
  label,
  value,
  valueClassName,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex items-center gap-2.5 text-muted-foreground">
        <Icon className="size-3.5 shrink-0" />
        <span className="text-xs">{label}</span>
      </div>
      <span className={cn("text-xs font-medium text-right", valueClassName)}>
        {value}
      </span>
    </div>
  );
}

export function getSubscriptionFlags(status: string) {
  return {
    isLive: status === "active" || status === "trialing",
    isCancelled: status === "cancelled",
    isExpired: status === "expired",
    isTrialing: status === "trialing",
    isPaused: status === "paused",
  };
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest mb-2 mt-5 first:mt-0">
      {children}
    </p>
  );
}

export function SubscriptionDetail({
  subscription: sub,
}: {
  subscription: Subscription;
}) {
  const router = useRouter();

  const plan = sub.plan;
  const status = STATUS_CONFIG[sub.status];
  const StatusIcon = status.icon;
  const tier = (plan?.tier ?? "free") as PlanTier;
  const tierCfg = TIER_CONFIG[tier];
  const TierIcon = tierCfg.icon;

  const { isLive, isCancelled, isExpired, isTrialing } = getSubscriptionFlags(
    sub.status,
  );

  const maxListings = plan?.maxListings ?? null;
  const listingsPct = maxListings
    ? Math.min(100, Math.round((sub.listingsCount / maxListings) * 100))
    : 0;

  const trialDaysLeft = sub.endDate ? daysUntil(sub.endDate) : null;
  const startedDaysAgo = daysSince(sub.startDate);
  const periodDaysLeft = sub.endDate ? daysUntil(sub.endDate) : 0;

  const total = startedDaysAgo + periodDaysLeft;

  const progress =
    total === 0 ? 100 : Math.round((startedDaysAgo / total) * 100);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-5 pt-6 pb-4 border-b border-border">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "size-10 rounded-lg border flex items-center justify-center shrink-0",
                tier === "pro" &&
                  "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800",
                tier === "business" &&
                  "bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800",
                tier === "free" && "bg-muted border-border",
                tier === "enterprise" && "bg-secondary border-border",
              )}
            >
              <TierIcon className={cn("size-5", tierCfg.iconCls)} />
            </div>
            <div>
              <h2 className="text-base font-semibold leading-tight">
                {plan?.name ?? "Unknown plan"}
              </h2>
              <p className="text-xs text-muted-foreground capitalize mt-0.5">
                {plan?.billingCycle ?? "—"} billing · {plan?.tier ?? "—"} tier
              </p>
            </div>
          </div>

          <Badge variant="outline" className={status.badgeCls}>
            <StatusIcon className="size-3" />
            {status.label}
          </Badge>
        </div>

        <p className="text-[10px] text-muted-foreground font-mono">
          SUB-{sub.id.slice(-10).toUpperCase()}
        </p>
      </div>

      <div className="flex-1 px-5 py-4 space-y-0 overflow-y-auto">
        {/* Trial countdown */}
        {isTrialing && trialDaysLeft !== null && (
          <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg px-3.5 py-3 mb-4">
            <Clock className="size-4 text-blue-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                {trialDaysLeft === 0
                  ? "Trial ends today"
                  : `${trialDaysLeft} day${trialDaysLeft !== 1 ? "s" : ""} left in trial`}
              </p>
              <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-0.5">
                No charge until {fmtDate(sub.endDate)}
              </p>
            </div>
          </div>
        )}

        {/* Cancelled warning */}
        {isCancelled && sub.endDate && new Date(sub.endDate) > new Date() && (
          <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg px-3.5 py-3 mb-4">
            <AlertTriangle className="size-4 text-amber-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
                Cancelled — access until {fmtDate(sub.endDate)}
              </p>
              <p className="text-[11px] text-amber-600/70 dark:text-amber-400/70 mt-0.5">
                Resume before this date to keep your subscription.
              </p>
            </div>
          </div>
        )}

        {/* Expired warning */}
        {isExpired && (
          <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg px-3.5 py-3 mb-4">
            <AlertTriangle className="size-4 text-red-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-red-700 dark:text-red-300">
                Subscription expired
              </p>
              <p className="text-[11px] text-red-600/70 dark:text-red-400/70 mt-0.5">
                Renew to restore access to your listings.
              </p>
            </div>
          </div>
        )}

        <SectionLabel>Billing</SectionLabel>
        <div className="bg-card divide-y divide-border/50">
          <DetailRow
            icon={CalendarDays}
            label="Period start"
            value={fmtDate(sub.startDate)}
          />
          <DetailRow
            icon={CalendarDays}
            label="Period end"
            value={fmtDate(sub.startDate)}
          />
          {sub.endDate && (
            <DetailRow
              icon={Clock}
              label="Trial ends"
              value={fmtDate(sub.endDate)}
              valueClassName={
                isTrialing && trialDaysLeft !== null && trialDaysLeft <= 3
                  ? "text-amber-600 dark:text-amber-400"
                  : undefined
              }
            />
          )}
          <DetailRow
            icon={RefreshCw}
            label="Auto-renew"
            value={
              sub.autoRenew ? (
                <span className="text-emerald-600 dark:text-emerald-400">
                  Enabled
                </span>
              ) : (
                <span className="text-muted-foreground">Disabled</span>
              )
            }
          />
          {sub.cancelledAt && (
            <DetailRow
              icon={XCircle}
              label="Cancelled on"
              value={fmtDate(sub.cancelledAt)}
              valueClassName="text-muted-foreground"
            />
          )}
          {sub.endDate && (
            <DetailRow
              icon={CalendarDays}
              label="Ends at"
              value={fmtDate(sub.endDate)}
              valueClassName="text-muted-foreground"
            />
          )}
          <DetailRow
            icon={CalendarDays}
            label="Subscribed"
            value={`${startedDaysAgo} day${startedDaysAgo !== 1 ? "s" : ""} ago`}
          />
        </div>

        {/* ── Plan section ── */}
        <SectionLabel>Plan details</SectionLabel>
        <div className="bg-card divide-y divide-border/50">
          <DetailRow
            icon={Percent}
            label="Commission rate"
            value={`${plan?.commissionRate ?? "—"}%`}
          />
          <DetailRow
            icon={TrendingUp}
            label="Search boost"
            value={`${plan?.priorityBoost ?? "—"}×`}
          />
          <DetailRow
            icon={ShieldCheck}
            label="Featured in search"
            value={
              plan?.featuredInSearch ? (
                <span className="text-emerald-600 dark:text-emerald-400">
                  Yes
                </span>
              ) : (
                <span className="text-muted-foreground">No</span>
              )
            }
          />
          {plan?.badgeLabel && (
            <DetailRow
              icon={ShieldCheck}
              label="Profile badge"
              value={`"${plan.badgeLabel}"`}
            />
          )}
        </div>

        {/* ── Usage section ── */}
        <SectionLabel>Usage</SectionLabel>
        <div className="rounded-lg border border-border/50 bg-card px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <LayoutList className="size-3.5" />
              <span className="text-xs">Listings used</span>
            </div>
            <span className="text-xs font-semibold">
              {sub.listingsCount}
              <span className="text-muted-foreground font-normal">
                {" "}
                / {maxListings ?? "∞"}
              </span>
            </span>
          </div>

          {maxListings ? (
            <>
              <Progress
                value={listingsPct}
                className={cn(
                  "h-1.5 mb-1.5",
                  listingsPct >= 90 && "[&>div]:bg-red-500",
                  listingsPct >= 70 &&
                    listingsPct < 90 &&
                    "[&>div]:bg-amber-500",
                  listingsPct < 70 && "[&>div]:bg-emerald-500",
                )}
              />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">
                  {listingsPct}% used
                </span>
                {listingsPct >= 80 && (
                  <button
                    className="text-[10px] text-primary underline underline-offset-2 hover:opacity-80"
                    onClick={() => router.push("/provider/plans")}
                  >
                    Upgrade plan →
                  </button>
                )}
              </div>
            </>
          ) : (
            <p className="text-[10px] text-muted-foreground">
              Unlimited listings
            </p>
          )}
        </div>

        {/* Period progress */}
        {isLive && (
          <div className="rounded-lg border border-border/50 bg-card px-4 py-3 mt-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="size-3.5" />
                <span className="text-xs">Period progress</span>
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                {periodDaysLeft <= 0
                  ? "Expired"
                  : `${periodDaysLeft}d remaining`}
              </span>
            </div>
            <Progress
              value={Math.min(100, progress)}
              className="h-1.5 [&>div]:bg-primary"
            />
          </div>
        )}
      </div>

      <SubscriptionActions
        subId={sub.id}
        status={sub.status}
        planId={sub.planId}
        billingCycle={plan?.billingCycle}
      />
    </div>
  );
}
