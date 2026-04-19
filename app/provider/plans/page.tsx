import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getActivePlans, getCurrentSubscription } from "@/actions/plans.action";
import { SubscriptionBanner } from "../_components/Subscriptionbanner";
import { PlansClient } from "../_components/Plansclient";
import Link from "next/link";
import { HelpCircle } from "lucide-react";

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
            Choose a plan that fits your business needs. If a free trial is
            included, billing will begin automatically after the trial ends.
            When the trial ends, access to features may be paused until you
            select an active plan. You can manage, upgrade, or cancel your
            subscription at any time..
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
          {[
            {
              q: "What happens after the trial ends?",
              a: "If a trial is included in your plan, billing will begin automatically after it ends. If no active plan is selected, access to features may be paused until you choose a plan.",
            },
            {
              q: "Can I change my plan later?",
              a: "Yes. You can upgrade or downgrade your plan at any time from your account. Changes take effect based on your current billing cycle or immediately, depending on the plan change.",
            },
            {
              q: "How does the listing limit work?",
              a: "Each active plan includes a maximum number of service listings. Only active listings count toward your limit. You can manage or archive listings at any time.",
            },
          ].map((item) => (
            <div
              key={item.q}
              className="group relative rounded-xl border border-border/40 bg-muted/20 p-4 transition-all hover:border-border hover:bg-muted/40 shadow-xs"
            >
              <div className="mb-3 flex items-center gap-2">
                <HelpCircle className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                <p className="text-xs font-semibold text-foreground leading-snug">
                  {item.q}
                </p>
              </div>

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
