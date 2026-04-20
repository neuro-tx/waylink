"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Inbox, ListFilter } from "lucide-react";
import { cn } from "@/lib/utils";
import { SubscriptionRow, STATUS_CONFIG } from "./SubscriptionRow";
import { SubscriptionDetail } from "./Subscriptiondetail";
import { Subscription, SubscriptionStatus } from "@/lib/all-types";

const FILTERS: { label: string; value: SubscriptionStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Trial", value: "trialing" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Expired", value: "expired" },
  { label: "Paused", value: "paused" },
];

function EmptyList({ hasFilter }: { hasFilter: boolean }) {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center flex-1 py-16 px-6 text-center">
      <div className="size-10 rounded-full bg-muted flex items-center justify-center mb-3">
        <Inbox className="size-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium mb-1">
        {hasFilter ? "No matching subscriptions" : "No subscriptions yet"}
      </p>
      <p className="text-xs text-muted-foreground max-w-50 leading-relaxed mb-4">
        {hasFilter
          ? "Try a different filter to see more results."
          : "Choose a plan to start your first subscription."}
      </p>
      {!hasFilter && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => router.push("/provider/plans")}
        >
          View plans <ArrowUpRight className="ml-1.5 size-3.5" />
        </Button>
      )}
    </div>
  );
}

function NothingSelected() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div className="size-10 rounded-full bg-muted flex items-center justify-center mb-3">
        <ListFilter className="size-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium mb-1">Select a subscription</p>
      <p className="text-xs text-muted-foreground leading-relaxed">
        Click any subscription from the list to view its full details, usage,
        and manage billing actions.
      </p>
    </div>
  );
}

interface SubscriptionClientProps {
  subscriptions: Subscription[];
}

export function SubscriptionClient({
  subscriptions: initial,
}: SubscriptionClientProps) {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState(initial);
  const [selectedId, setSelectedId] = useState<string | null>(
    initial.find((s) => s.status === "active" || s.status === "trialing")?.id ??
      initial[0]?.id ??
      null,
  );
  const [filter, setFilter] = useState<SubscriptionStatus | "all">("all");

  const filtered =
    filter === "all"
      ? subscriptions
      : subscriptions.filter((s) => s.status === filter);

  const selected = subscriptions.find((s) => s.id === selectedId) ?? null;

  const handleMutate = useCallback(() => {
    router.refresh();
  }, [router]);

  function countFor(f: SubscriptionStatus | "all") {
    if (f === "all") return subscriptions.length;
    return subscriptions.filter((s) => s.status === f).length;
  }

  return (
    <div className="flex h-full min-h-0 overflow-hidden rounded-xl border border-border/50 bg-card">
      <div
        className={cn(
          "flex flex-col border-r border-border/50 bg-background",
          selected
            ? "hidden md:flex md:w-72 lg:w-80 xl:w-96 shrink-0"
            : "flex w-full md:w-72 lg:w-80 xl:w-96 md:shrink-0",
        )}
      >
        <div className="px-4 py-3.5 border-b border-border/50">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Subscriptions</h2>
            <span className="text-xs text-muted-foreground">
              {subscriptions.length} total
            </span>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {FILTERS.map((f) => {
              const count = countFor(f.value);
              if (count === 0 && f.value !== "all") return null;
              const statusCfg =
                f.value !== "all" ? STATUS_CONFIG[f.value] : null;

              return (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={cn(
                    "inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border transition-colors",
                    filter === f.value
                      ? statusCfg
                        ? statusCfg.badgeCls
                        : "bg-foreground text-background border-foreground"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-border/80",
                  )}
                >
                  {f.label}
                  {count > 0 && (
                    <span
                      className={cn(
                        "text-[10px] font-semibold",
                        filter === f.value ? "opacity-80" : "opacity-60",
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-border/30">
          {filtered.length === 0 ? (
            <EmptyList hasFilter={filter !== "all"} />
          ) : (
            filtered.map((sub) => (
              <SubscriptionRow
                key={sub.id}
                subscription={sub}
                isSelected={selectedId === sub.id}
                onClick={() => setSelectedId(sub.id)}
              />
            ))
          )}
        </div>

        {/* Go to plans CTA */}
        <div className="px-4 py-3 border-t border-border/50">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => router.push("/provider/plans")}
          >
            <ArrowUpRight className="size-3.5 mr-1.5" />
            Manage plans
          </Button>
        </div>
      </div>

      {/* ── RIGHT: Detail panel ── */}
      <div
        className={cn(
          "flex-1 min-w-0",
          // On mobile: show only if something is selected
          selected ? "flex flex-col" : "hidden md:flex md:flex-col",
        )}
      >
        {/* Mobile back button */}
        {selected && (
          <div className="md:hidden px-4 py-2.5 border-b border-border/50">
            <button
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
              onClick={() => setSelectedId(null)}
            >
              ← Back to subscriptions
            </button>
          </div>
        )}

        {selected ? (
          <SubscriptionDetail subscription={selected} onMutate={handleMutate} />
        ) : (
          <NothingSelected />
        )}
      </div>
    </div>
  );
}
