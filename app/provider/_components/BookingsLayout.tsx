"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import {
  BookingSortOption,
  BookingStats,
  ProviderBookingShape,
  STATUS_TRANSITIONS,
} from "@/lib/panel-types";
import { BookingStatus } from "@/lib/all-types";
import {
  Hash,
  TrendingUp,
  CircleDollarSign,
  Users,
  Search,
  CheckCircle2,
  Ban,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { fmtCurrency } from "@/lib/helpers";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const STATUS_FILTERS = [
  "all",
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "expired",
] as const;

export const actionConfig: Record<
  BookingStatus,
  {
    label: string;
    variant: "default" | "destructive" | "outline";
    icon: React.ElementType;
  }
> = {
  confirmed: { label: "Confirm", variant: "default", icon: CheckCircle2 },
  completed: { label: "Complete", variant: "default", icon: CheckCircle2 },
  cancelled: { label: "Cancel", variant: "destructive", icon: Ban },
  pending: { label: "Reopen", variant: "outline", icon: RefreshCw },
  expired: { label: "Expired", variant: "outline", icon: XCircle },
};

export function BookingsControls({ stats }: { stats: BookingStats | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const statusFromUrl = (searchParams.get("status") ?? "all") as
    | BookingStatus
    | "all";
  const sortFromUrl = (searchParams.get("sort") ??
    "newest") as BookingSortOption;

  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") ?? "",
  );
  const debouncedSearch = useDebounce(searchInput);

  function pushParams(patch: Record<string, string | null>) {
    const p = new URLSearchParams(searchParams.toString());
    Object.entries(patch).forEach(([k, v]) => {
      if (!v || v === "all" || v === "newest" || v === "1") p.delete(k);
      else p.set(k, v);
    });
    router.push(`${pathname}?${p.toString()}`, { scroll: false });
  }

  useEffect(() => {
    pushParams({ search: debouncedSearch || null, page: "1" });
  }, [debouncedSearch]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-50 max-w-xs">
        <Search
          size={13}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Search order, customer, product…"
          className="pl-8 h-8 text-xs"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {STATUS_FILTERS.map((s) => {
          const count =
            s !== "all" && stats ? ` · ${stats[s as BookingStatus]}` : "";
          return (
            <button
              key={s}
              onClick={() => pushParams({ status: s, page: "1" })}
              className={cn(
                "px-3 py-1 rounded-full text-xs border capitalize transition-all",
                statusFromUrl === s
                  ? "bg-foreground text-background border-foreground font-medium"
                  : "border-border text-muted-foreground hover:border-foreground/50 hover:text-foreground",
              )}
            >
              {s === "all" ? "All" : s}
              {count}
            </button>
          );
        })}
      </div>

      <Select
        value={sortFromUrl}
        onValueChange={(v) => pushParams({ sort: v, page: "1" })}
      >
        <SelectTrigger className="h-8 text-xs w-45 ml-auto">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest first</SelectItem>
          <SelectItem value="oldest">Oldest first</SelectItem>
          <SelectItem value="highest_amount">Highest amount</SelectItem>
          <SelectItem value="lowest_amount">Lowest amount</SelectItem>
          <SelectItem value="most_participants">Most participants</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

type CardConfig = {
  label: string;
  icon: React.ElementType;
  color: string;
  getValue: (s: BookingStats) => string;
  getSub: (s: BookingStats) => string;
};

const statsConfig: CardConfig[] = [
  {
    label: "Total bookings",
    icon: Hash,
    color: "text-blue-500",
    getValue: (s) => s.total.toLocaleString(),
    getSub: (s) => `${s.pending} pending • ${s.confirmed} confirmed`,
  },
  {
    label: "Completed revenue",
    icon: TrendingUp,
    color: "text-emerald-500",
    getValue: (s) => fmtCurrency(s.totalRevenue, s.currency),
    getSub: (s) => `${s.completed} completed`,
  },
  {
    label: "Pipeline revenue",
    icon: CircleDollarSign,
    color: "text-violet-500",
    getValue: (s) => fmtCurrency(s.pendingRevenue, s.currency),
    getSub: () => "pending + confirmed",
  },
  {
    label: "Status breakdown",
    icon: Users,
    color: "text-amber-500",
    getValue: (s) => `${s.confirmed} / ${s.cancelled}`,
    getSub: (s) => `confirmed vs cancelled • ${s.expired} expired`,
  },
];

export function BookingsStatsBar({ stats }: { stats: BookingStats | null }) {
  const isLoading = !stats;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {statsConfig.map((c) => {
        const Icon = c.icon;

        return (
          <Card key={c.label} className="border bg-card">
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{c.label}</span>
                <Icon size={20} className={c.color} />
              </div>

              {isLoading ? (
                <Skeleton className="h-6 w-20" />
              ) : (
                <p className="text-xl font-semibold tracking-tight text-foreground">
                  {c.getValue(stats)}
                </p>
              )}

              {isLoading ? (
                <Skeleton className="h-3 w-24" />
              ) : (
                <p className="text-xs text-muted-foreground">
                  {c.getSub(stats)}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function StatusActions({
  booking,
  onTransition,
}: {
  booking: ProviderBookingShape;
  onTransition: (id: string, status: BookingStatus) => Promise<void>;
}) {
  const allowed = STATUS_TRANSITIONS[booking.status];
  if (allowed.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {allowed.map((target) => {
        const cfg = actionConfig[target];
        const Icon = cfg.icon;

        const description =
          target === "cancelled"
            ? "This booking will be marked as cancelled. This cannot be undone."
            : target === "completed"
              ? "Mark this booking as completed and finalise revenue."
              : `Move this booking to "${target}" status.`;

        return (
          <AlertDialog key={target}>
            <AlertDialogTrigger asChild>
              <Button
                variant={cfg.variant}
                size="sm"
                className="gap-1.5 text-xs h-8"
              >
                <Icon size={13} />
                {cfg.label}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {cfg.label} booking #{booking.orderNumber}?
                </AlertDialogTitle>
                <AlertDialogDescription>{description}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className={cn(
                    target === "cancelled" &&
                      "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
                  )}
                  onClick={() => onTransition(booking.id, target)}
                >
                  {cfg.label}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        );
      })}
    </div>
  );
}
