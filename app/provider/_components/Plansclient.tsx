"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  XCircle,
  Zap,
  Star,
  Building2,
  Gift,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { SubscribeDialog } from "./Subscribedialog";
import type { Plan, PlanBillingCycle, Subscription } from "@/lib/all-types";

interface PlansClientProps {
  monthlyPlans: Plan[];
  yearlyPlans: Plan[];
  currentSubscription: Subscription | null;
}

// ── Tier metadata ─────────────────────────────────────────────────────────────
const TIER_META: Record<
  string,
  {
    icon: React.ElementType;
    badgeCls: string;
    popular?: boolean;
    ctaCls?: string;
  }
> = {
  free: {
    icon: Gift,
    badgeCls: "bg-muted text-muted-foreground border-border",
  },
  pro: {
    icon: Zap,
    badgeCls:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
    popular: true,
    ctaCls: "bg-blue-600 hover:bg-blue-700 text-white border-0",
  },
  business: {
    icon: Star,
    badgeCls:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
  },
  enterprise: {
    icon: Building2,
    badgeCls: "bg-secondary text-foreground border-border",
  },
};

function TierIcon({ tier, className }: { tier: string; className?: string }) {
  const Icon = TIER_META[tier]?.icon ?? Gift;
  return <Icon className={cn("size-4", className)} />;
}

function PlanCard({
  plan,
  billingCycle,
  isCurrent,
  isActive,
  onSelect,
}: {
  plan: Plan;
  billingCycle: PlanBillingCycle;
  isCurrent: boolean;
  isActive: boolean;
  onSelect: (plan: Plan) => void;
}) {
  const meta = TIER_META[plan.tier] ?? TIER_META.free;
  const price = parseFloat(plan.price);
  const isFree = price === 0;
  const isEnterprise = plan.tier === "enterprise";

  const priceNote = isEnterprise
    ? "Contact us for pricing"
    : isFree
      ? "No credit card required"
      : billingCycle === "yearly"
        ? `$${(price * 12).toFixed(0)}/yr · billed annually`
        : "Billed monthly · cancel anytime";

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-xl border bg-card p-6 transition-all duration-200",
        "hover:border-border/80 hover:shadow-sm",
        isCurrent && "border-primary ring-1 ring-primary",
        meta.popular && !isCurrent && "border-blue-200 dark:border-blue-700",
        !isCurrent && !meta.popular && "border-border/50",
      )}
    >
      {meta.popular && !isCurrent && (
        <div className="absolute -top-px left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-b-md bg-blue-600 px-3 py-1 text-[10px] font-medium text-white">
            <Sparkles className="size-3" /> Most popular
          </span>
        </div>
      )}

      {isCurrent && (
        <div className="absolute -top-px left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-b-md bg-primary px-3 py-1 text-[10px] font-medium text-primary-foreground">
            Current plan
          </span>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "size-10 rounded-md flex items-center justify-center border",
              meta.badgeCls,
            )}
          >
            <TierIcon tier={plan.tier} />
          </div>
          <div>
            <p className="text-sm font-medium">{plan.name}</p>
            <Badge
              variant="outline"
              className={cn("text-[10px] h-4 px-1.5 capitalize", meta.badgeCls)}
            >
              {plan.tier}
            </Badge>
          </div>
        </div>

        {plan.featuredInSearch && (
          <Badge
            variant="outline"
            className="text-[10px] h-5 gap-1 border-amber-300 text-amber-600 dark:text-amber-400"
          >
            <Star className="size-2.5" /> Featured
          </Badge>
        )}
      </div>

      <p className="text-xs text-muted-foreground mb-2 leading-relaxed min-h-10">
        {plan.description}
      </p>

      <div className="mb-4">
        <div className="flex items-baseline gap-1">
          {!isFree && !isEnterprise && (
            <span className="text-sm text-muted-foreground">$</span>
          )}
          <span className="text-3xl font-semibold tracking-tight">
            {isEnterprise ? "Custom" : isFree ? "Free" : price.toFixed(0)}
          </span>
          {!isFree && !isEnterprise && (
            <span className="text-sm text-muted-foreground">/mo</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{priceNote}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { label: "Commission", value: `${plan.commissionRate}%` },
          {
            label: "Listings",
            value: plan.maxListings?.toString() ?? "Unlimited",
          },
          { label: "Search boost", value: `${plan.priorityBoost}×` },
          {
            label: "Featured",
            value: plan.featuredInSearch ? "Yes" : "No",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-md bg-muted/50 px-2.5 py-2 text-center"
          >
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              {s.label}
            </p>
            <p className="text-xs font-medium">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-border/40 mb-4" />

      {/* Highlights */}
      {plan.highlights && plan.highlights.length > 0 && (
        <ul className="space-y-1 mb-5 flex-1">
          {plan.highlights.map((h, i) => (
            <li
              key={i}
              className="flex items-center gap-2 text-xs text-muted-foreground"
            >
              <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
              {h}
            </li>
          ))}
        </ul>
      )}

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
          Contact sales <ArrowUpRight className="ml-2 size-3.5" />
        </Button>
      ) : (
        <Button
          className={cn("w-full", meta.ctaCls ?? "")}
          onClick={() => onSelect(plan)}
        >
          {isFree ? "Start for free" : "Start 14-day trial"}
        </Button>
      )}
    </div>
  );
}

// ── Main client component ────────────────────────────────────────────────────
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

  return (
    <>
      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <span
          className={cn(
            "text-sm font-medium transition-colors",
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
            "text-sm font-medium cursor-pointer transition-colors",
            billingCycle === "yearly"
              ? "text-foreground"
              : "text-muted-foreground",
          )}
        >
          Yearly
        </Label>
      </div>

      {/* Plans grid */}
      {plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 py-16 px-6 text-center">
          <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Sparkles className="size-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">
            No plans available
          </p>
          <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
            There are no active plans configured for{" "}
            <span className="font-medium capitalize">{billingCycle}</span>{" "}
            billing yet. Try switching to{" "}
            <button
              className="underline underline-offset-2 hover:text-foreground transition-colors"
              onClick={() =>
                setBillingCycle(
                  billingCycle === "monthly" ? "yearly" : "monthly",
                )
              }
            >
              {billingCycle === "monthly" ? "yearly" : "monthly"}
            </button>{" "}
            or check back soon.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              billingCycle={billingCycle}
              isCurrent={currentSubscription?.planId === plan.id}
              isActive={
                currentSubscription?.status === "active" ||
                currentSubscription?.status === "trialing"
              }
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}

      {/* Subscribe dialog */}
      <SubscribeDialog
        plan={selectedPlan}
        billingCycle={billingCycle}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
