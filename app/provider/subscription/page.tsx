import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getSubscriptionHistory, getActivePlans } from "@/actions/plans.action";
import { SubscriptionClient } from "../_components/Subscriptionclient";
import { Subscription, Plan } from "@/lib/all-types";

function SubscriptionSkeleton() {
  return (
    <div className="flex h-full rounded-xl border border-border/50 overflow-hidden">
      <div className="w-80 shrink-0 border-r border-border/50 flex flex-col">
        <div className="px-4 py-3.5 border-b border-border/50 space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-10" />
          </div>
          <div className="flex gap-1.5">
            {[60, 48, 52, 64, 56].map((w) => (
              <Skeleton
                key={w}
                className="h-5 rounded-full"
                style={{ width: w }}
              />
            ))}
          </div>
        </div>
        <div className="flex-1 divide-y divide-border/30">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="px-4 py-3.5 space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-4 w-14 rounded-full" />
              </div>
              <Skeleton className="h-3 w-48" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 p-6 space-y-4">
        <Skeleton className="h-16 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
      </div>
    </div>
  );
}

async function SubscriptionContent() {
  const [historyResult, monthlyResult, yearlyResult] = await Promise.all([
    getSubscriptionHistory(),
    getActivePlans("monthly"),
    getActivePlans("yearly"),
  ]);

  if (!historyResult.success || !monthlyResult.success || !yearlyResult) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4 text-sm text-destructive">
        Failed to load subscriptions. Please refresh or contact support.
      </div>
    );
  }

  const allPlans: Plan[] = [
    ...(monthlyResult.data ?? []),
    ...(yearlyResult.data ?? []),
  ];
  const planMap = new Map<string, Plan>(allPlans.map((p) => [p.id, p]));

  const subscriptions: Subscription[] = (historyResult.data ?? []).map(
    (sub) => ({
      ...sub,
      plan: planMap.get(sub.planId),
    }),
  );

  return <SubscriptionClient subscriptions={subscriptions} />;
}

export default function SubscriptionPage() {
  return (
    <div className="flex flex-col h-full px-4 md:px-6 py-6 w-full">
      <div className="mb-6 shrink-0">
        <h1 className="text-2xl font-semibold tracking-tight">Subscription</h1>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed max-w-lg">
          View your full subscription history, track usage, and manage billing —
          cancel, resume, or renew from any subscription below.
        </p>
      </div>

      <div className="flex-1 min-h-0">
        <Suspense fallback={<SubscriptionSkeleton />}>
          <SubscriptionContent />
        </Suspense>
      </div>
    </div>
  );
}
