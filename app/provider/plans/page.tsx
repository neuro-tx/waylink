import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getActivePlans, getCurrentSubscription } from "@/actions/plans.action";
import { SubscriptionBanner } from "../_components/Subscriptionbanner";
import { PlansClient } from "../_components/Plansclient";
import Link from "next/link";

function PlansSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="size-8 rounded-md" />
            <div className="space-y-1">
              <Skeleton className="h-3.5 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-8 w-24" />
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 4 }).map((_, j) => (
              <Skeleton key={j} className="h-12 rounded-md" />
            ))}
          </div>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, j) => (
              <Skeleton key={j} className="h-3 w-full" />
            ))}
          </div>
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
      ))}
    </div>
  );
}

// Plans content (async)
async function PlansContent() {
  const [monthlyResult, yearlyResult, subResult] = await Promise.all([
    getActivePlans("monthly"),
    getActivePlans("yearly"),
    getCurrentSubscription(),
  ]);

  if (!monthlyResult.success || !yearlyResult.success) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4 text-sm text-destructive">
        Failed to load plans. Please refresh the page or contact support.
      </div>
    );
  }

  const monthlyPlans = monthlyResult.data ?? [];
  const yearlyPlans = yearlyResult.data ?? [];
  const currentSubscription = subResult.data ?? null;

  // Enrich subscription with plan details for the banner
  const enrichedSub = currentSubscription
    ? {
        ...currentSubscription,
        plan: monthlyPlans.find((p) => p.id === currentSubscription.planId),
      }
    : null;

  return (
    <>
      <SubscriptionBanner subscription={enrichedSub} />
      <PlansClient
        monthlyPlans={monthlyPlans}
        yearlyPlans={yearlyPlans}
        currentSubscription={currentSubscription}
      />
    </>
  );
}

export default function PlansPage() {
  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 space-y-1 px-4 md:px-6 py-6 w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            Plans & billing
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed max-w-xl">
            Choose the plan that fits your business. All paid plans include a
            14-day free trial — no charge until the trial ends. Upgrade,
            downgrade, or cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
          {[
            {
              q: "What happens after the trial?",
              a: "You'll be charged on your chosen billing cycle. Cancel before the trial ends and you won't be billed.",
            },
            {
              q: "Can I change plans later?",
              a: "Yes — upgrade or downgrade at any time. Changes take effect immediately.",
            },
            {
              q: "How does the listing limit work?",
              a: "Each active service listing counts toward your plan's max. Archived listings don't count.",
            },
          ].map((item) => (
            <div
              key={item.q}
              className="rounded-lg border border-border/50 bg-muted/30 px-4 py-3 hover:border-border transition-all"
            >
              <p className="text-xs font-medium text-foreground mb-1">
                {item.q}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {item.a}
              </p>
            </div>
          ))}
        </div>

        <Suspense fallback={<PlansSkeleton />}>
          <PlansContent />
        </Suspense>

        <p className="text-xs text-muted-foreground text-center pt-8 pb-4">
          All prices in USD. Commission is deducted per completed booking.{" "}
          <Link
            href="/provider/support"
            className="underline underline-offset-2 hover:text-foreground"
          >
            Terms apply.
          </Link>
        </p>
      </div>
    </div>
  );
}
