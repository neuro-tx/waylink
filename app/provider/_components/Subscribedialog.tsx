"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Sparkles,
  LayoutDashboard,
  Rss,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Plan, PlanBillingCycle } from "@/lib/all-types";
import { subscribeToPlan } from "@/actions/plans.action";
import Link from "next/link";

interface SubscribeDialogProps {
  plan: Plan | null;
  billingCycle: PlanBillingCycle;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "review" | "payment" | "success";

const TIER_COLORS: Record<string, string> = {
  free: "bg-muted text-muted-foreground",
  pro: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  business: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  enterprise: "bg-secondary text-foreground",
};

function getTrialEndDate(plan: Plan): Date {
  const d = new Date();
  d.setDate(d.getDate() + (plan.trialDays ?? 14));
  return d;
}

function formatTrialEndDate(plan: Plan): string {
  return getTrialEndDate(plan).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatPrice(plan: Plan, cycle: PlanBillingCycle): string {
  if (plan.isFree) return "Free";
  return `$${plan.price.toFixed(0)}/${cycle === "monthly" ? "mo" : "yr"}`;
}

function StepBar({ step }: { step: Step }) {
  const steps: Step[] = ["review", "payment", "success"];
  const current = steps.indexOf(step);

  return (
    <div className="flex items-center gap-1.5 mb-6">
      {steps.map((s, i) => (
        <div
          key={s}
          className={cn(
            "h-1 flex-1 rounded-full transition-all duration-300",
            i <= current ? "bg-primary" : "bg-border",
          )}
        />
      ))}
    </div>
  );
}

function PlanPill({
  plan,
  billingCycle,
}: {
  plan: Plan;
  billingCycle: PlanBillingCycle;
}) {
  return (
    <div className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-3 mb-5">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{plan.name}</span>
        <Badge
          className={cn("text-[10px] px-2 py-0 h-4", TIER_COLORS[plan.tier])}
        >
          {plan.tier}
        </Badge>
      </div>
      <span className="text-sm text-muted-foreground">
        {formatPrice(plan, billingCycle)}
      </span>
    </div>
  );
}

function ReviewStep({
  plan,
  billingCycle,
  onNext,
  onClose,
}: {
  plan: Plan;
  billingCycle: PlanBillingCycle;
  onNext: () => void;
  onClose: () => void;
}) {
  const trialDays = plan.trialDays ?? 14;

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle className="text-lg">Review your plan</DialogTitle>
        <DialogDescription>
          Confirm what's included before{" "}
          {plan.isFree ? "activating" : "starting your trial"}.
        </DialogDescription>
      </DialogHeader>

      <PlanPill plan={plan} billingCycle={billingCycle} />

      {plan.highlights && plan.highlights.length > 0 && (
        <ul className="space-y-2.5">
          {plan.highlights.map((h, i) => (
            <li
              key={i}
              className="flex items-center gap-2 text-sm text-foreground"
            >
              <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
              {h}
            </li>
          ))}
        </ul>
      )}

      <Separator />

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Commission", value: `${plan.commissionRate}%` },
          { label: "Max listings", value: plan.maxListings ?? "∞" },
          { label: "Boost", value: `${plan.priorityBoost}×` },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-muted/50 rounded-md px-3 py-2 text-center"
          >
            <p className="text-[10px] text-muted-foreground mb-0.5 uppercase tracking-wide">
              {s.label}
            </p>
            <p className="text-sm font-medium">{s.value}</p>
          </div>
        ))}
      </div>

      {plan.trialEnabled && !plan.isFree && (
        <p className="text-xs text-muted-foreground text-center">
          <ShieldCheck className="inline size-3.5 mr-1 mb-0.5 text-emerald-500" />
          {trialDays}-day free trial — no charge until{" "}
          <span className="font-medium text-foreground">
            {formatTrialEndDate(plan)}
          </span>
          . Cancel anytime.
        </p>
      )}

      <p className="text-xs text-muted-foreground leading-relaxed">
        <span className="font-medium text-foreground">Note:</span> This plan
        renews automatically by default. You can manage or disable auto-renewal
        from{" "}
        <Link
          href="/provider/subscription"
          className="font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
        >
          the subscription page
        </Link>
        .
      </p>

      <div className="flex gap-2 pt-1">
        <Button variant="outline" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button className="flex-1" onClick={onNext}>
          Continue <ArrowRight className="ml-2 size-4" />
        </Button>
      </div>
    </div>
  );
}

function PaymentStep({
  plan,
  billingCycle,
  onBack,
  onSuccess,
}: {
  plan: Plan;
  billingCycle: PlanBillingCycle;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  function fmtCard(v: string) {
    return v
      .replace(/\D/g, "")
      .substring(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();
  }

  function fmtExp(v: string) {
    const d = v.replace(/\D/g, "").substring(0, 4);
    return d.length >= 3 ? d.slice(0, 2) + " / " + d.slice(2) : d;
  }

  function handleSubmit() {
    if (
      !name ||
      cardNumber.length < 19 ||
      expiry.length < 7 ||
      cvc.length < 3
    ) {
      setError("Please fill in all payment fields.");
      return;
    }
    setError(null);

    startTransition(async () => {
      const result = await subscribeToPlan({ planId: plan.id, billingCycle });
      if (!result.success) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      onSuccess();
    });
  }

  return (
    <>
      <DialogHeader className="mb-4">
        <DialogTitle className="text-lg">Payment details</DialogTitle>
        <DialogDescription>
          {plan.trialEnabled ? (
            <>
              Your card won't be charged until{" "}
              <span className="font-medium text-foreground">
                {formatTrialEndDate(plan)}
              </span>
              .
            </>
          ) : (
            "You'll be charged immediately upon subscribing."
          )}
        </DialogDescription>
      </DialogHeader>

      <PlanPill plan={plan} billingCycle={billingCycle} />

      <div className="space-y-3 mb-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Cardholder name</Label>
          <Input
            placeholder="Name on card"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Card number</Label>
          <Input
            placeholder="4242 4242 4242 4242"
            value={cardNumber}
            onChange={(e) => setCardNumber(fmtCard(e.target.value))}
            maxLength={19}
            disabled={isPending}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Expiry</Label>
            <Input
              placeholder="MM / YY"
              value={expiry}
              onChange={(e) => setExpiry(fmtExp(e.target.value))}
              maxLength={7}
              disabled={isPending}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">CVC</Label>
            <Input
              placeholder="•••"
              maxLength={4}
              value={cvc}
              onChange={(e) => setCvc(e.target.value.replace(/\D/g, ""))}
              disabled={isPending}
            />
          </div>
        </div>
      </div>

      {error && <p className="text-xs text-destructive mb-3">{error}</p>}

      <p className="text-xs text-muted-foreground text-center mb-4">
        <ShieldCheck className="inline size-3.5 mr-1 mb-0.5 text-emerald-500" />
        Secured by 256-bit TLS encryption.{" "}
        {plan.trialEnabled && "Cancel anytime before trial ends."}
      </p>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack} disabled={isPending}>
          <ArrowLeft className="size-4" /> Back
        </Button>
        <Button className="flex-1" onClick={handleSubmit} disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="animate-spin size-4" /> Processing…
            </>
          ) : (
            <>
              <Rss className="size-4" /> Subscribe
            </>
          )}
        </Button>
      </div>
    </>
  );
}

function FreeActivationStep({
  plan,
  billingCycle,
  onBack,
  onSuccess,
}: {
  plan: Plan;
  billingCycle: PlanBillingCycle;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleActivate() {
    startTransition(async () => {
      const result = await subscribeToPlan({ planId: plan.id, billingCycle });
      if (!result.success) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      onSuccess();
    });
  }

  return (
    <>
      <DialogHeader className="mb-2">
        <DialogTitle className="text-lg">Activate free plan</DialogTitle>
        <DialogDescription>
          No credit card required. You can upgrade anytime.
        </DialogDescription>
      </DialogHeader>

      <PlanPill plan={plan} billingCycle={billingCycle} />

      <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 mb-4">
        <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium mb-2">
          What you get for free
        </p>
        <ul className="space-y-1.5">
          {(plan.highlights ?? []).map((h, i) => (
            <li
              key={i}
              className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400"
            >
              <CheckCircle2 className="size-3.5 shrink-0" />
              {h}
            </li>
          ))}
        </ul>
      </div>

      {error && <p className="text-sm text-destructive mb-3">{error}</p>}

      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack} disabled={isPending}>
          <ArrowLeft className="size-4" /> Back
        </Button>
        <Button
          className="flex-1"
          onClick={handleActivate}
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Activating…
            </>
          ) : (
            "Activate free plan"
          )}
        </Button>
      </div>
    </>
  );
}

function SuccessStep({
  plan,
  billingCycle,
  onClose,
}: {
  plan: Plan;
  billingCycle: PlanBillingCycle;
  onClose: () => void;
}) {
  const router = useRouter();

  return (
    <div className="text-center py-2">
      <div className="size-14 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="size-7 text-emerald-500" />
      </div>

      <h2 className="text-lg font-medium mb-2">You're subscribed!</h2>
      <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
        {plan.isFree
          ? "Your free plan is active. Start adding your services now."
          : plan.trialEnabled
            ? `Your ${plan.trialDays ?? 14}-day trial has started. No charge until ${formatTrialEndDate(plan)}.`
            : "Your subscription is now active."}
      </p>

      <div className="grid grid-cols-2 gap-2.5 mb-6 text-left">
        {[
          { label: "Plan", value: plan.name },
          {
            label: "Status",
            value: plan.trialEnabled && !plan.isFree ? "trialing" : "active",
          },
          { label: "Billing", value: billingCycle },
          { label: "Commission", value: `${plan.commissionRate}%` },
          {
            label: "Max listings",
            value: plan.maxListings?.toString() ?? "Unlimited",
          },
          {
            label: "Trial ends",
            value:
              plan.trialEnabled && !plan.isFree
                ? formatTrialEndDate(plan)
                : "N/A",
          },
        ].map((s) => (
          <div key={s.label} className="bg-muted/50 rounded-md px-3 py-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
              {s.label}
            </p>
            <p className="text-sm font-medium capitalize">{s.value}</p>
          </div>
        ))}
      </div>

      <Button
        className="w-full"
        onClick={() => {
          onClose();
          router.push("/provider/services/new");
        }}
      >
        <Sparkles className="size-4" /> Create listing
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="w-full mt-2 text-muted-foreground"
        onClick={() => {
          onClose();
          router.push("/provider");
        }}
      >
        <LayoutDashboard className="size-4" /> Go to dashboard
      </Button>
    </div>
  );
}

export function SubscribeDialog({
  plan,
  billingCycle,
  open,
  onOpenChange,
}: SubscribeDialogProps) {
  const [step, setStep] = useState<Step>("review");

  useEffect(() => {
    if (open) setStep("review");
  }, [open, plan?.id]);

  if (!plan || plan.tier === "enterprise") return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <StepBar step={step} />

        {step === "review" && (
          <ReviewStep
            plan={plan}
            billingCycle={billingCycle}
            onNext={() => setStep("payment")}
            onClose={() => onOpenChange(false)}
          />
        )}

        {step === "payment" && !plan.isFree && (
          <PaymentStep
            plan={plan}
            billingCycle={billingCycle}
            onBack={() => setStep("review")}
            onSuccess={() => setStep("success")}
          />
        )}

        {step === "payment" && plan.isFree && (
          <FreeActivationStep
            plan={plan}
            billingCycle={billingCycle}
            onBack={() => setStep("review")}
            onSuccess={() => setStep("success")}
          />
        )}

        {step === "success" && (
          <SuccessStep
            plan={plan}
            billingCycle={billingCycle}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
