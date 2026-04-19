"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Zap,
  Star,
  Building2,
  Gift,
  ArrowUpRight,
  Sparkles,
  Clock,
} from "lucide-react";
import { SubscribeDialog } from "./Subscribedialog";
import type { Plan, PlanBillingCycle, Subscription } from "@/lib/all-types";

interface PlansClientProps {
  monthlyPlans: Plan[];
  yearlyPlans: Plan[];
  currentSubscription: Subscription | null;
}

const TIER_META: Record<
  string,
  {
    icon: React.ElementType;
    badgeCls: string;
    iconWrapCls: string;
    popular?: boolean;
    ctaCls?: string;
  }
> = {
  free: {
    icon: Gift,
    badgeCls: "bg-muted text-muted-foreground border-border",
    iconWrapCls: "bg-muted border-border",
  },
  pro: {
    icon: Zap,
    badgeCls:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
    iconWrapCls:
      "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800",
    popular: true,
    ctaCls: "bg-blue-600 hover:bg-blue-700 text-white border-0",
  },
  business: {
    icon: Star,
    badgeCls:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
    iconWrapCls:
      "bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800",
  },
  enterprise: {
    icon: Building2,
    badgeCls: "bg-secondary text-foreground border-border",
    iconWrapCls: "bg-secondary border-border",
  },
};

function trialLabel(plan: Plan): string | null {
  if (!plan.trialEnabled) return null;
  const days = plan.trialDays ?? 14;
  return `${days}-day free trial`;
}

function priceNote(plan: Plan, billingCycle: PlanBillingCycle): string {
  if (plan.tier === "enterprise") return "Contact us for pricing";
  if (plan.isFree) return "No credit card required";
  if (billingCycle === "yearly")
    return `$${(plan.price * 12).toFixed(0)}/yr · billed annually`;
  return "Billed monthly · cancel anytime";
}

function ctaLabel(plan: Plan): string {
  if (plan.isFree) return "Start for free";
  if (plan.trialEnabled) {
    const days = plan.trialDays ?? 7;
    return `Start ${days}-day trial`;
  }
  return "Get started";
}

function PlanCard({
  plan,
  billingCycle,
  isCurrent,
  onSelect,
}: {
  plan: Plan;
  billingCycle: PlanBillingCycle;
  isCurrent: boolean;
  onSelect: (plan: Plan) => void;
}) {
  const meta = TIER_META[plan.tier] ?? TIER_META.free;
  const isEnterprise = plan.tier === "enterprise";
  const trial = trialLabel(plan);

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-xl border bg-card p-6 transition-all duration-200",
        "hover:shadow-sm",
        isCurrent
          ? "border-primary ring-1 ring-primary"
          : meta.popular
            ? "border-blue-200 dark:border-indigo-800 hover:border-indigo-300 dark:hover:border-indigo-700"
            : "border-border/50 hover:border-border/80",
      )}
    >
      {isCurrent && (
        <div className="absolute -top-px left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="inline-flex items-center gap-1 rounded-b-md bg-primary px-3 py-1 text-[10px] font-medium text-primary-foreground">
            Current plan
          </span>
        </div>
      )}
      {!isCurrent && meta.popular && (
        <div className="absolute -top-px left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="inline-flex items-center gap-1.5 rounded-b-md bg-indigo-600 px-3 py-1 text-[10px] font-medium text-white">
            <Sparkles className="size-2.5" /> Most popular
          </span>
        </div>
      )}

      <div className="flex items-start justify-between mb-4 mt-1">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "size-10 rounded-lg flex items-center justify-center border shrink-0",
              meta.iconWrapCls,
            )}
          >
            <meta.icon
              className={cn(
                "size-4",
                meta.badgeCls.split(" ").find((c) => c.startsWith("text-")),
              )}
            />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">{plan.name}</p>
            <Badge
              variant="outline"
              className={cn(
                "capitalize",
                meta.badgeCls,
              )}
            >
              {plan.tier}
            </Badge>
          </div>
        </div>

        {plan.featuredInSearch && !isCurrent && (
          <Badge
            variant="outline"
            className="h-5 shrink-0 border-amber-300 text-amber-600 dark:text-amber-400 dark:border-amber-700"
          >
            <Star className="size-2.5" /> Featured
          </Badge>
        )}
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed min-h-10">
        {plan.description ?? `The ${plan.name} plan.`}
      </p>

      <div className="mb-4">
        <div className="flex items-baseline gap-1">
          {!plan.isFree && !isEnterprise && (
            <span className="text-base text-muted-foreground">$</span>
          )}
          <span className="text-3xl font-bold tracking-tight">
            {isEnterprise
              ? "Custom"
              : plan.isFree
                ? "Free"
                : plan.price.toFixed(0)}
          </span>
          {!plan.isFree && !isEnterprise && (
            <span className="text-sm text-muted-foreground font-normal">
              /mo
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {priceNote(plan, billingCycle)}
        </p>
      </div>

      {trial && (
        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-full px-2.5 py-1 mb-3 w-fit">
          <Clock className="size-3 shrink-0" />
          {trial} included
        </div>
      )}

      <div className="grid grid-cols-2 gap-1.5 mb-4">
        {[
          { label: "Commission", value: `${plan.commissionRate}%` },
          {
            label: "Listings",
            value:
              plan.maxListings != null ? String(plan.maxListings) : "Unlimited",
          },
          { label: "Search boost", value: `${plan.priorityBoost}×` },
          { label: "Featured", value: plan.featuredInSearch ? "Yes" : "No" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-md bg-muted/40 px-2.5 py-2 text-center"
          >
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
              {s.label}
            </p>
            <p className="text-xs font-semibold">{s.value}</p>
          </div>
        ))}
      </div>

      {plan.badgeLabel && (
        <div>
          <span className="inline-flex items-center text-[10px] font-medium bg-muted border border-border rounded-full px-2 py-0.5 gap-1">
            <Star className="size-2.5 text-amber-500" />
            &ldquo;{plan.badgeLabel}&rdquo;
          </span>
        </div>
      )}

      <div className="border-t border-border/40 my-3" />

      {plan.highlights && plan.highlights.length > 0 && (
        <ul className="space-y-1.5 mb-4 flex-1">
          {plan.highlights.map((h, i) => (
            <li
              key={i}
              className="flex items-start gap-1.5 text-xs text-muted-foreground"
            >
              <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 mt-px" />
              {h}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto pt-1">
        {isCurrent ? (
          <Button variant="outline" className="w-full" disabled>
            Current plan
          </Button>
        ) : isEnterprise ? (
          <Button
            variant="outline"
            className="w-full"
            onClick={() =>
              window.open(
                "mailto:sales@waylink.com?subject=Enterprise Plan Inquiry",
              )
            }
          >
            Contact sales <ArrowUpRight className="size-3.5" />
          </Button>
        ) : (
          <Button
            className={cn("w-full", meta.ctaCls ?? "")}
            onClick={() => onSelect(plan)}
          >
            {ctaLabel(plan)}
          </Button>
        )}
      </div>
    </div>
  );
}

function EmptyPlans({
  billingCycle,
  onSwitch,
}: {
  billingCycle: PlanBillingCycle;
  onSwitch: () => void;
}) {
  const other = billingCycle === "monthly" ? "yearly" : "monthly";

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 py-16 px-6 text-center">
      <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <Sparkles className="size-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground mb-1">
        No plans available
      </p>
      <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
        No active plans are configured for{" "}
        <span className="font-medium capitalize">{billingCycle}</span> billing
        yet. Try switching to{" "}
        <button
          className="underline underline-offset-2 hover:text-foreground transition-colors"
          onClick={onSwitch}
        >
          {other}
        </button>{" "}
        or check back soon.
      </p>
    </div>
  );
}

export function PlansClient({
  monthlyPlans,
  yearlyPlans,
  currentSubscription,
}: PlansClientProps) {
  const [billingCycle, setBillingCycle] = useState<PlanBillingCycle>("monthly");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const plans = billingCycle === "monthly" ? monthlyPlans : yearlyPlans;

  function handleSelect(plan: Plan) {
    setSelectedPlan(plan);
    setDialogOpen(true);
  }

  function toggleCycle() {
    setBillingCycle((c) => (c === "monthly" ? "yearly" : "monthly"));
  }

  return (
    <>
      <div className="flex items-center justify-center gap-3 mb-8">
        <span
          className={cn(
            "text-sm font-medium transition-colors select-none",
            billingCycle === "monthly"
              ? "text-foreground"
              : "text-muted-foreground",
          )}
        >
          Monthly
        </span>

        <Switch
          checked={billingCycle === "yearly"}
          onCheckedChange={(v) => setBillingCycle(v ? "yearly" : "monthly")}
          id="billing-toggle"
        />

        <Label
          htmlFor="billing-toggle"
          className={cn(
            "text-sm font-medium transition-colors select-none",
            billingCycle === "yearly"
              ? "text-foreground"
              : "text-muted-foreground",
          )}
        >
          Yearly
        </Label>
      </div>

      {plans.length === 0 ? (
        <EmptyPlans billingCycle={billingCycle} onSwitch={toggleCycle} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              billingCycle={billingCycle}
              isCurrent={currentSubscription?.planId === plan.id}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}

      <SubscribeDialog
        plan={selectedPlan}
        billingCycle={billingCycle}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
