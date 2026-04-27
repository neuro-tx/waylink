"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
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
  Download,
  Search,
  Users,
  ChevronLeft,
  ChevronRight,
  X,
  Loader,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  Customer,
  CustomerSegment,
  CustomerStats,
  CustomerStatus,
  CustomerSortOption,
} from "@/lib/all-types";
import { useDebounce } from "@/hooks/useDebounce";
import { CustomerRow, StatsBar, TableSkeleton } from "./CustomersComps";

export default function CustomersClient() {
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
          {exporting ? (
            <>
              <Loader className="size-4 animate-spin" />
              Exporting…
            </>
          ) : (
            <>
              <Download size={13} />
              Export CSV
            </>
          )}
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
              <TableHead className="text-xs h-10">
                Segment
              </TableHead>
              <TableHead className="text-xs h-10">Lifetime value</TableHead>
              <TableHead className="text-xs h-10">
                Orders
              </TableHead>
              <TableHead className="text-xs h-10">
                Last order
              </TableHead>
              <TableHead className="text-xs h-10 text-right">Expand</TableHead>
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
