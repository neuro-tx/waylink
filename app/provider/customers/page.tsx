"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronDown,
  ChevronUp,
  Download,
  Search,
  ShieldBan,
  ShieldCheck,
  Users,
  TrendingUp,
  CircleDollarSign,
  UserX,
  ChevronLeft,
  ChevronRight,
  ReceiptText,
  X,
} from "lucide-react";
import { cn, fmtDate } from "@/lib/utils";
import type {
  Customer,
  CustomerOrder,
  CustomerSegment,
  CustomerStats,
  CustomerStatus,
  CustomerSortOption,
} from "@/lib/all-types";
import { useDebounce } from "@/hooks/useDebounce";

function fmtCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const statusConfig: Record<
  CustomerStatus,
  { label: string; className: string }
> = {
  active: {
    label: "Active",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  },
  blocked: {
    label: "Blocked",
    className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  },
  churned: {
    label: "Churned",
    className: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  },
};

const segmentConfig: Record<
  CustomerSegment,
  { label: string; className: string }
> = {
  new: {
    label: "New",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  },
  returning: {
    label: "Returning",
    className:
      "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400",
  },
  loyal: {
    label: "Loyal",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  },
};

const orderStatusConfig: Record<CustomerOrder["status"], string> = {
  pending:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  completed:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  cancelled: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  expired: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

function StatsBar({ stats }: { stats: CustomerStats }) {
  const cards = [
    {
      icon: Users,
      label: "Total customers",
      value: stats.total.toLocaleString(),
      sub: `${stats.active} active`,
      color: "text-blue-500",
    },
    {
      icon: TrendingUp,
      label: "Total revenue",
      value: fmtCurrency(stats.totalRevenue),
      sub: "all time",
      color: "text-emerald-500",
    },
    {
      icon: CircleDollarSign,
      label: "Avg. lifetime value",
      value: fmtCurrency(stats.avgLifetimeValue),
      sub: "per customer",
      color: "text-violet-500",
    },
    {
      icon: UserX,
      label: "Blocked / Churned",
      value: `${stats.blocked} / ${stats.churned}`,
      sub: "need attention",
      color: "text-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((c) => (
        <Card key={c.label} className="border bg-card">
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{c.label}</span>
              <c.icon size={20} className={c.color} />
            </div>
            <p className="text-xl font-semibold tracking-tight text-foreground">
              {c.value}
            </p>
            <p className="text-xs text-muted-foreground">{c.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ExpandedOrders({ customer }: { customer: Customer }) {
  if (customer.orders.length === 0) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
        <ReceiptText size={15} />
        No orders found for this customer.
      </div>
    );
  }
  return (
    <div className="rounded-lg border bg-muted/30 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b border-border">
            <TableHead className="text-xs h-8">Order ID</TableHead>
            <TableHead className="text-xs h-8">Product</TableHead>
            <TableHead className="text-xs h-8">Status</TableHead>
            <TableHead className="text-xs h-8 text-right">Amount</TableHead>
            <TableHead className="text-xs h-8">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customer.orders.map((o) => (
            <TableRow
              key={o.id}
              className="hover:bg-muted/50 border-b border-border/50 last:border-0"
            >
              <TableCell className="text-xs text-muted-foreground font-mono py-2">
                #{o.id.slice(-8).toUpperCase()}
              </TableCell>
              <TableCell className="text-xs py-2 max-w-40 truncate">
                {o.productName}
              </TableCell>
              <TableCell className="py-2">
                <span
                  className={cn(
                    "text-[11px] font-medium px-2 py-0.5 rounded-full capitalize",
                    orderStatusConfig[o.status],
                  )}
                >
                  {o.status}
                </span>
              </TableCell>
              <TableCell className="text-xs text-right py-2 font-medium">
                {fmtCurrency(o.totalAmount, o.currency)}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground py-2">
                {fmtDate(o.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function CustomerRow({ customer }: { customer: Customer }) {
  const [expanded, setExpanded] = useState(false);

  const sc = statusConfig[customer.status];
  const seg = segmentConfig[customer.segment];

  return (
    <>
      <TableRow
        className={cn(
          "cursor-pointer transition-colors hover:bg-muted/50",
          expanded && "bg-muted/30",
        )}
        onClick={() => setExpanded((p) => !p)}
      >
        <TableCell className="py-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={customer.image ?? undefined} />
              <AvatarFallback className="text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                {initials(customer?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{customer.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {customer.email}
              </p>
            </div>
          </div>
        </TableCell>

        <TableCell className="py-3">
          <span
            className={cn(
              "text-xs font-medium px-2.5 py-1 rounded-full",
              sc.className,
            )}
          >
            {sc.label}
          </span>
        </TableCell>

        {/* Segment */}
        <TableCell className="py-3 hidden sm:table-cell">
          <span
            className={cn(
              "text-[11px] font-medium px-2.5 py-1 rounded-full",
              seg.className,
            )}
          >
            {seg.label}
          </span>
        </TableCell>

        {/* LTV */}
        <TableCell className="py-3 text-sm font-medium">
          {fmtCurrency(customer.lifetimeValue, customer.currency)}
        </TableCell>

        {/* Orders */}
        <TableCell className="py-3 hidden md:table-cell">
          <div className="text-sm">{customer.totalOrders}</div>
          <div className="text-xs text-muted-foreground">
            {customer.completedOrders} completed
          </div>
        </TableCell>

        {customer?.lastOrderAt && (
          <TableCell className="py-3 text-xs text-muted-foreground hidden lg:table-cell">
            {fmtDate(customer.lastOrderAt)}
          </TableCell>
        )}

        {/* Actions */}
        <TableCell className="py-3" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1 justify-end">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setExpanded((p) => !p)}
            >
              {expanded ? <ChevronUp size={15} /> : <ChevronDown size={14} />}
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {expanded && (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={7} className="py-4 px-4">
            <div className="ml-11">
              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                <ReceiptText size={12} />
                Order history
              </p>
              <ExpandedOrders customer={customer} />
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell className="py-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-36" />
              </div>
            </div>
          </TableCell>
          {[1, 2, 3, 4, 5, 6].map((j) => (
            <TableCell key={j} className="py-3">
              <Skeleton className="h-3 w-16" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export default function CustomersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const statusFromUrl = (searchParams.get("status") ?? "all") as
    | CustomerStatus
    | "all";
  const segmentFromUrl = (searchParams.get("segment") ?? "all") as
    | CustomerSegment
    | "all";
  const sortFromUrl = (searchParams.get("sort") ??
    "newest") as CustomerSortOption;
  const pageFromUrl = Number(searchParams.get("page") ?? "1");

  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") ?? "",
  );
  const debouncedSearch = useDebounce(searchInput, 400);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [pagination, setPagination] = useState<{
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    page: number;
    limit: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [expError, setExpError] = useState<string | null>(null);

  const pushParams = useCallback(
    (patch: Record<string, string | null>) => {
      const p = new URLSearchParams(searchParams.toString());
      Object.entries(patch).forEach(([k, v]) => {
        if (!v || v === "all" || v === "newest" || v === "1") p.delete(k);
        else p.set(k, v);
      });
      router.push(`${pathname}?${p.toString()}`, { scroll: false });
    },
    [searchParams, pathname, router],
  );

  const setStatus = (v: string) => pushParams({ status: v, page: "1" });
  const setSegment = (v: string) => pushParams({ segment: v, page: "1" });
  const setSort = (v: string) => pushParams({ sort: v, page: "1" });
  const setPage = (v: number) => pushParams({ page: String(v) });

  useEffect(() => {
    pushParams({ search: debouncedSearch || null, page: "1" });
  }, [debouncedSearch]);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const p = new URLSearchParams();
      if (statusFromUrl !== "all") p.set("status", statusFromUrl);
      if (segmentFromUrl !== "all") p.set("segment", segmentFromUrl);
      if (debouncedSearch) p.set("search", debouncedSearch);
      p.set("sort", sortFromUrl);
      p.set("page", String(pageFromUrl));
      p.set("limit", "10");

      const res = await fetch(`/api/provider/panel/customers?${p.toString()}`);
      if (!res.ok) throw new Error("Failed to load customers");
      const json = await res.json();
      const data = json.data;

      setCustomers(data.customers);
      setStats(data.stats);
      setPagination(data.pagination);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [
    statusFromUrl,
    segmentFromUrl,
    debouncedSearch,
    sortFromUrl,
    pageFromUrl,
  ]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  /* CSV export */
  async function handleExport() {
    setExporting(true);
    setExpError(null);
    try {
      const res = await fetch(`/api/provider/panel/customers/report`);
      if (!res.ok) throw new Error("Exporting data is failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `customers-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setExpError(err.message);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-6 py-6 w-full px-4 md:px-6">
      {expError && (
        <div
          role="alert"
          className="flex items-start gap-2 py-4 px-3 border border-destructive/50 bg-destructive/20 rounded-xl relative"
        >
          <button
            aria-label="Dismiss error"
            className="absolute top-1 right-2 p-1 rounded-md hover:bg-destructive/10"
            onClick={() => setExpError(null)}
          >
            <X size={15} />
          </button>

          <p className="text-sm text-destructive pr-6">{expError}</p>
        </div>
      )}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your customer base, track value, and control access.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs h-8"
          onClick={handleExport}
          disabled={exporting}
          aria-describedby={expError ? "export-error" : undefined}
        >
          <Download size={13} />
          {exporting ? "Exporting…" : "Export CSV"}
        </Button>
      </div>

      {stats ? (
        <StatsBar stats={stats} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      )}

      <Separator />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-50 max-w-xs">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search name or email…"
            className="pl-8 h-8 text-xs"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        {/* Status filter pills */}
        <div className="flex gap-1.5 flex-wrap">
          {(["all", "active", "blocked", "churned"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cn(
                "px-3 py-1 rounded-full text-xs border capitalize transition-all",
                statusFromUrl === s
                  ? "bg-foreground text-background border-foreground font-medium"
                  : "border-border/50 hover:border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {s === "all" ? "All" : s}
              {s !== "all" && stats ? ` · ${stats[s as CustomerStatus]}` : ""}
            </button>
          ))}
        </div>

        {/* Segment */}
        <Select value={segmentFromUrl} onValueChange={setSegment}>
          <SelectTrigger className="h-8 text-xs w-35">
            <SelectValue placeholder="Segment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All segments</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="returning">Returning</SelectItem>
            <SelectItem value="loyal">Loyal</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sortFromUrl} onValueChange={setSort}>
          <SelectTrigger className="h-8 text-xs w-40 ml-auto">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest customer</SelectItem>
            <SelectItem value="oldest">Oldest customer</SelectItem>
            <SelectItem value="highest_ltv">Highest LTV</SelectItem>
            <SelectItem value="lowest_ltv">Lowest LTV</SelectItem>
            <SelectItem value="most_orders">Most orders</SelectItem>
            <SelectItem value="recent_order">Recent order</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border">
              <TableHead className="text-xs h-10 w-65">Customer</TableHead>
              <TableHead className="text-xs h-10">Status</TableHead>
              <TableHead className="text-xs h-10 hidden sm:table-cell">
                Segment
              </TableHead>
              <TableHead className="text-xs h-10">Lifetime value</TableHead>
              <TableHead className="text-xs h-10 hidden md:table-cell">
                Orders
              </TableHead>
              <TableHead className="text-xs h-10 hidden lg:table-cell">
                Last order
              </TableHead>
              <TableHead className="text-xs h-10 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableSkeleton />
            ) : error ? (
              <TableRow>
                <TableCell colSpan={7} className="py-16 text-center">
                  <p className="text-sm text-destructive">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={fetchCustomers}
                  >
                    Retry
                  </Button>
                </TableCell>
              </TableRow>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-16 text-center text-muted-foreground"
                >
                  <Users size={32} className="mx-auto mb-3 opacity-20" />
                  <p className="text-sm">
                    No customers match the current filters.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              customers.map((c) => <CustomerRow key={c.id} customer={c} />)
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1}–
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} customers
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              disabled={!pagination.hasPrevPage}
              onClick={() => setPage(pageFromUrl - 1)}
            >
              <ChevronLeft size={13} /> Previous
            </Button>
            <Button
              size="sm"
              className="h-8 gap-1.5 text-xs"
              disabled={!pagination.hasNextPage}
              onClick={() => setPage(pageFromUrl + 1)}
            >
              Next <ChevronRight size={13} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
