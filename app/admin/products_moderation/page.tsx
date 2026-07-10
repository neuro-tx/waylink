"use client";

import { useState, useCallback, useTransition, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  AlertTriangle,
  Car,
  CheckCircle2,
  Compass,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { Pagination, ServiceType } from "@/lib/all-types";
import { StatusType } from "@/lib/panel-types";
import { AdminProductsTableData, ProductsSummary } from "@/lib/admin-types";
import { ProductsOverview } from "../_components/ProductsOverview";
import {
  DataPagination,
  ProductsTable,
  ProductStatusBadge,
  STATUS_META,
} from "../_components/ProductsTable";
import ThumbnailImage from "@/components/ThumbnailImage";
import { serviceUrl } from "@/lib/url-builder";
import { useDebounce } from "@/hooks/useDebounce";
import { DropdownList } from "@/app/provider/_components/ProductLayout";
import { getAdminProducts, getProductsSummary } from "@/actions/service.action";

type Transition = {
  to: StatusType;
  label: string;
  icon: React.ReactNode;
  destructive?: boolean;
};

type SortKey =
  | "all"
  | "-basePrice"
  | "basePrice"
  | "-bookingsCount"
  | "-reviewsCount"
  | "-averageRating";

type ActionResult<T> =
  | { success: true; error?: undefined; data: T }
  | { success: false; error: string; data?: undefined };

type AdminProductsResponse = {
  result: AdminProductsTableData[];
  pagination: Pagination;
};

const STATUS_TABS: { key: StatusType | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "paused", label: "Paused" },
  { key: "draft", label: "Draft" },
  { key: "archived", label: "Archived" },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "all", label: "View All" },
  { value: "-basePrice", label: "Price: High → Low" },
  { value: "basePrice", label: "Price: Low → High" },
  { value: "-bookingsCount", label: "Most Booked" },
  { value: "-reviewsCount", label: "Most Reviews" },
  { value: "-averageRating", label: "Most Rated" },
];

const SERVICE_TYPES = ["all", "transport", "experience"] as const;

type ConfirmPayload = {
  product: AdminProductsTableData;
  transition: Transition;
};

function ConfirmDialog({
  payload,
  loading,
  onConfirm,
  onCancel,
}: {
  payload: ConfirmPayload | null;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!payload) return null;
  const { product, transition } = payload;

  return (
    <Dialog open onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-sm gap-0 p-0 overflow-hidden">
        <div className="px-4 py-5 space-y-4">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-3">
              <div
                className={`size-8 rounded-md flex items-center justify-center ${transition.destructive ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-500"}`}
              >
                {transition.destructive ? (
                  <AlertTriangle className="size-4.5" />
                ) : (
                  <CheckCircle2 className="size-4.5" />
                )}
              </div>
              <DialogTitle className="text-base">
                {transition.label} this product?
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm leading-relaxed">
              {transition.to === "archived"
                ? `"${product.title}" will be archived and hidden from all users. You can restore it to draft later.`
                : `"${product.title}" will be set to ${STATUS_META[transition.to].label.toLowerCase()}.`}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2.5 rounded-lg border bg-muted/40 px-3 py-2.5">
            <ThumbnailImage alternative={product.title} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">{product.title}</p>
              <p className="text-xs text-muted-foreground">
                {product.provider.name}
              </p>
            </div>
            <ProductStatusBadge status={product.status} />
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant={transition.destructive ? "destructive" : "default"}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              {loading ? "Updating…" : transition.label}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SummarySkeleton() {
  return (
    <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-md border bg-card p-3 flex items-start gap-3"
        >
          <Skeleton className="size-8 rounded-full shrink-0" />

          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProductsModerationPage() {
  const [products, setProducts] = useState<AdminProductsTableData[]>([]);
  const [activeTab, setActiveTab] = useState<StatusType | "all">("all");
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState<ServiceType | "all">(
    "all",
  );
  const [sort, setSort] = useState<SortKey>("all");

  const [isTableLoading, setIsTableLoading] = useState(false);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmPayload | null>(null);
  const [, startTransition] = useTransition();
  const [summary, setSummary] = useState<ProductsSummary | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    limit: 0,
    offset: 0,
    page: 1,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const debouncedSearch = useDebounce(search);
  const firstRender = useRef(true);
  const tableAbortRef = useRef<AbortController | null>(null);
  const summaryAbortRef = useRef<AbortController | null>(null);

  const buildUrl = useCallback(
    (page: number) =>
      serviceUrl({
        search: debouncedSearch,
        status: activeTab,
        service: serviceFilter,
        sort,
        page,
      }),
    [debouncedSearch, activeTab, serviceFilter, sort],
  );

  const fetchTable = useCallback(async (url: string, page: number) => {
    tableAbortRef.current?.abort();
    const controller = new AbortController();
    tableAbortRef.current = controller;

    setIsTableLoading(true);
    setError(null);

    try {
      const res = (await getAdminProducts(
        url,
      )) as ActionResult<AdminProductsResponse>;
      if (controller.signal.aborted) return;

      if (!res.success) {
        setError(res.error);
        return;
      }

      setProducts(res.data.result);
      setPagination(res.data.pagination);
      setCurrentPage(page);
    } finally {
      if (!controller.signal.aborted) setIsTableLoading(false);
    }
  }, []);

  const fetchSummary = useCallback(async () => {
    summaryAbortRef.current?.abort();
    const controller = new AbortController();
    summaryAbortRef.current = controller;

    setIsSummaryLoading(true);

    try {
      const res = (await getProductsSummary()) as ActionResult<ProductsSummary>;
      if (controller.signal.aborted) return;

      if (!res.success) {
        setError(res.error);
        return;
      }

      setSummary(res.data);
    } finally {
      if (!controller.signal.aborted) setIsSummaryLoading(false);
    }
  }, []);

  useEffect(() => {
    firstRender.current = false;
    fetchTable(buildUrl(1), 1);
    fetchSummary();

    return () => {
      tableAbortRef.current?.abort();
      summaryAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (firstRender.current) return;
    fetchTable(buildUrl(1), 1);
  }, [buildUrl]);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page === currentPage || isTableLoading) return;
      fetchTable(buildUrl(page), page);
    },
    [buildUrl, currentPage, isTableLoading, fetchTable],
  );

  const applyTransition = useCallback(
    (productId: string, newStatus: StatusType) => {
      startTransition(() => {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId
              ? { ...p, status: newStatus, updatedAt: new Date() }
              : p,
          ),
        );
      });
    },
    [],
  );

  const handleTransition = useCallback(
    (product: AdminProductsTableData, transition: Transition) => {
      setConfirm({ product, transition });
    },
    [],
  );

  const handleConfirm = useCallback(async () => {
    if (!confirm) return;
    setLoadingId(confirm.product.id);
    setError(null);
    try {
      await new Promise<void>((res, rej) =>
        setTimeout(() => (Math.random() > 0.1 ? res() : rej()), 900),
      );
      applyTransition(confirm.product.id, confirm.transition.to);
      setConfirm(null);
    } catch {
      setError(
        `Failed to ${confirm.transition.label.toLowerCase()} "${confirm.product.title}".`,
      );
      setConfirm(null);
    } finally {
      setLoadingId(null);
    }
  }, [confirm, applyTransition]);

  return (
    <TooltipProvider>
      <div className="space-y-6 px-4 md:px-6 py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Product moderation
            </h1>
            <p className="text-sm text-muted-foreground">
              Review, moderate, and track performance across all provider
              listings
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-lg border bg-muted/40 p-1 shrink-0">
            {SERVICE_TYPES.map((s) => (
              <Button
                key={s}
                variant={serviceFilter === s ? "secondary" : "ghost"}
                size="sm"
                className="h-7 text-xs gap-1.5"
                onClick={() => setServiceFilter(s)}
              >
                {s === "transport" && <Car className="h-3 w-3" />}
                {s === "experience" && <Compass className="h-3 w-3" />}
                <span className="capitalize">
                  {s === "all" ? "All types" : s}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="py-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between gap-4">
              {error}
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 shrink-0 text-destructive"
                onClick={() => setError(null)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {isSummaryLoading ? (
          <SummarySkeleton />
        ) : summary ? (
          <ProductsOverview summary={summary} />
        ) : null}

        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search products or providers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full md:w-80 text-sm"
            />
            {search && (
              <button
                className="absolute bg-transparent grid place-items-center right-1.5 top-1/2 -translate-y-1/2 size-5"
                onClick={() => setSearch("")}
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 md:ml-auto">
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as StatusType | "all")}
            >
              <TabsList className="h-auto p-1 flex-nowrap gap-0.5">
                {STATUS_TABS.map(({ key, label }) => (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className="text-sm h-7 cursor-pointer"
                  >
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <DropdownList
              value={sort}
              onChange={(v) => setSort(v)}
              options={SORT_OPTIONS}
            />
          </div>
        </div>

        <ProductsTable
          products={products}
          isLoading={isTableLoading}
          loadingId={loadingId}
          search={search}
          onClearSearch={() => setSearch("")}
          onTransition={handleTransition}
        />

        <DataPagination
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </div>

      <ConfirmDialog
        payload={confirm}
        loading={!!loadingId && confirm?.product.id === loadingId}
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
      />
    </TooltipProvider>
  );
}
