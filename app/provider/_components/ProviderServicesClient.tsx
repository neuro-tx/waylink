"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, SlidersHorizontal, BookOpen, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ProductProps,
  ServiceGridCard,
  ServiceListRow,
  ServicesToolbar,
} from "./ProductLayout";
import { useProviderContext } from "@/components/providers/ProviderContext";
import { useDebounce } from "@/hooks/useDebounce";
import { serviceUrl } from "@/lib/url-builder";
import { Pagination } from "@/lib/all-types";
import ServiceActions, { SelectedItem } from "./ServiceActions";

type SortKey =
  | "all"
  | "-basePrice"
  | "basePrice"
  | "-bookingsCount"
  | "-reviewsCount"
  | "-averageRating";
type Status = "all" | "draft" | "active" | "paused" | "archived";
type PageState = "loading" | "fetching-more" | "error" | "empty" | "loaded";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "all", label: "View All" },
  { value: "-basePrice", label: "Price: High → Low" },
  { value: "basePrice", label: "Price: Low → High" },
  { value: "-bookingsCount", label: "Most Booked" },
  { value: "-reviewsCount", label: "Most Reviews" },
  { value: "-averageRating", label: "Most Rated" },
];

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "archived", label: "Archived" },
];

const DEFAULT_PAGINATION: Pagination = {
  total: 0,
  limit: 20,
  offset: 0,
  page: 1,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
};

export default function ProviderServicesClient() {
  const { config } = useProviderContext();
  const router = useRouter();
  const [services, setServices] = useState<ProductProps[]>([]);
  const [pagination, setPagination] = useState<Pagination>(DEFAULT_PAGINATION);
  const [pageState, setPageState] = useState<PageState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<Map<string, SelectedItem>>(
    new Map(),
  );
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("all");
  const [status, setStatus] = useState<Status>("all");
  const [page, setPage] = useState(1);
  const [isHydrated, setIsHydrated] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const debouncedSearch = useDebounce(search, 400);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    setPage(1);
    setSelected(new Map());
  }, [debouncedSearch, sort, status]);

  useEffect(() => {
    if (isFetchingRef.current) return;
    const controller = new AbortController();

    const fetchServices = async () => {
      isFetchingRef.current = true;
      setError(null);
      setPageState(page === 1 ? "loading" : "fetching-more");

      try {
        const url = serviceUrl({
          search: debouncedSearch,
          sort,
          status,
          page,
          limit: 20,
        });

        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);

        const json = await res.json();
        const payload = json.data ?? json;
        const items: ProductProps[] = payload.data ?? [];
        const meta: Pagination = payload.pagination ?? DEFAULT_PAGINATION;

        if (page === 1) {
          setServices(items);
          setPageState(items.length === 0 ? "empty" : "loaded");
        } else {
          setServices((prev) => [...prev, ...items]);
          setPageState("loaded");
        }

        setPagination(meta);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        setError(err.message || "Failed to load services");
        setPageState("error");
      } finally {
        isFetchingRef.current = false;
      }
    };

    fetchServices();

    return () => {
      controller.abort();
      isFetchingRef.current = false;
    };
  }, [debouncedSearch, sort, status, page, retryKey]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          pagination.hasNextPage &&
          pageState === "loaded" &&
          !isFetchingRef.current
        ) {
          setPage((prev) => prev + 1);
        }
      },
      { rootMargin: "200px", threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [pagination.hasNextPage, pageState]);

  useEffect(() => {
    const saved = localStorage.getItem("services-view");
    if (saved === "grid" || saved === "list") {
      setView(saved);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    localStorage.setItem("services-view", view);
  }, [view, isHydrated]);

  const toggleSelect = useCallback(
    (id: string, mainStatus: "draft" | "active" | "paused" | "archived") => {
      setSelected((prev) => {
        const n = new Map(prev);
        n.has(id)
          ? n.delete(id)
          : n.set(id, {
              id,
              status: mainStatus || "draft",
            });
        return n;
      });
    },
    [],
  );

  const clearSelection = useCallback(() => setSelected(new Map()), []);

  const selectAll = useCallback(() => {
    setSelected(
      new Map(services.map((s) => [s.id, { id: s.id, status: s.status }])),
    );
  }, [services]);

  const activeFiltersCount = [
    status !== "all",
    sort !== "all",
    search !== "",
  ].filter(Boolean).length;

  const showingFrom =
    pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const showingTo = Math.min(
    pagination.page * pagination.limit,
    pagination.total,
  );

  return (
    <div className="px-4 md:px-6 py-6 w-full overflow-x-hidden">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-georgia">
            My Services
          </h1>
          <p className="text-sm text-muted-foreground font-georgia">
            Manage your complete service catalog
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/provider/services/create")}
          className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold text-white transition-colors hover:opacity-90 cursor-pointer"
          style={{ background: config.themeColor }}
        >
          <Plus className="w-3.5 h-3.5" /> Add service
        </motion.button>
      </div>

      <ServicesToolbar
        search={search}
        onSearchChange={setSearch}
        sort={sort}
        onSortChange={setSort}
        sortOptions={SORT_OPTIONS}
        status={status}
        onStatusChange={setStatus}
        statusOptions={STATUS_OPTIONS}
        view={view}
        onViewChange={setView}
      />

      <AnimatePresence>
        {selected.size > 0 && (
          <ServiceActions
            selected={selected}
            total={pagination.total}
            selectAll={selectAll}
            clearSelection={clearSelection}
            onSuccess={(ids, status) => {
              const idsSet = new Set(ids);

              setServices((prev) =>
                prev.map((service) =>
                  idsSet.has(service.id) ? { ...service, status } : service,
                ),
              );
            }}
          />
        )}
      </AnimatePresence>

      {pageState === "loaded" && (
        <div className="flex items-center justify-between mb-4">
          {pagination.total === 0 ? (
            <span className="text-xs text-muted-foreground">
              No services found
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">
              Showing{" "}
              <span className="text-foreground font-medium">{showingFrom}</span>
              {" – "}
              <span className="text-foreground font-medium">{showingTo}</span>
              {" of "}
              <span className="text-foreground font-medium">
                {pagination.total}
              </span>
              {" services"}
              <span className="ml-2 text-xs text-muted-foreground">
                (Page {pagination.page} of {pagination.totalPages})
              </span>
            </span>
          )}
          {activeFiltersCount > 0 && (
            <button
              onClick={() => {
                setSearch("");
                setSort("all");
                setStatus("all");
              }}
              className={cn(
                "flex items-center gap-1.5 text-xs transition-colors cursor-pointer hover:bg-muted px-3 py-1 rounded-md",
                config.twTextColor,
              )}
            >
              <SlidersHorizontal className="w-3 h-3" />
              Clear {activeFiltersCount} filter
              {activeFiltersCount > 1 ? "s" : ""}
            </button>
          )}
        </div>
      )}

      {pageState === "loading" && (
        <div className="flex flex-col items-center justify-center py-24">
          <div
            className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin"
            style={{
              borderColor: `${config.themeColor}40`,
              borderTopColor: config.themeColor,
            }}
          />
          <p className="text-sm text-muted-foreground mt-4">
            Loading services…
          </p>
        </div>
      )}

      {pageState === "error" && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <X className="size-9 text-destructive mb-4" />
          <h3 className="text-lg font-semibold">Something went wrong</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            {error || "Failed to load services"}
          </p>
          <button
            onClick={() => setRetryKey((k) => k + 1)}
            className="text-sm px-4 py-2 rounded-lg border border-border hover:bg-muted transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {pageState === "empty" && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <BookOpen className="size-9 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold font-georgia">
            {activeFiltersCount > 0
              ? "No services match your filters"
              : "No services yet"}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            {activeFiltersCount > 0
              ? "Try adjusting your search or filters"
              : "Add your first service to get started"}
          </p>
          {activeFiltersCount > 0 ? (
            <button
              onClick={() => {
                setSearch("");
                setSort("all");
                setStatus("all");
              }}
              className="text-sm px-4 py-2 rounded-lg border border-border hover:bg-muted transition cursor-pointer"
            >
              Clear filters
            </button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/provider/services/new")}
              className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-md text-white font-semibold hover:opacity-90 cursor-pointer"
              style={{ background: config.themeColor }}
            >
              <Plus className="w-4 h-4" /> Add your first service
            </motion.button>
          )}
        </div>
      )}

      {pageState === "loaded" && view === "grid" && (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          <AnimatePresence>
            {services.map((s, i) => (
              <ServiceGridCard
                key={s.id}
                service={s}
                selected={selected.has(s.id)}
                onSelect={() => toggleSelect(s.id, s.status)}
                onEdit={() => router.push(`/provider/services/${s.id}/edit`)}
                isFirst={i === 0}
                onView={() => router.push(`/provider/services/${s.id}/review`)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {pageState === "loaded" && view === "list" && (
        <div className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {services.map((s) => (
              <ServiceListRow
                key={s.id}
                service={s}
                selected={selected.has(s.id)}
                onSelect={() => toggleSelect(s.id, s.status)}
                onEdit={() => router.push(`/provider/services/${s.id}/edit`)}
                onView={() => router.push(`/provider/services/${s.id}/review`)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {pageState === "fetching-more" && (
        <div className="flex items-center justify-center py-6">
          <div
            className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
            style={{
              borderColor: `${config.themeColor}40`,
              borderTopColor: config.themeColor,
            }}
          />
        </div>
      )}

      <div ref={loadMoreRef} className="h-1" />
    </div>
  );
}
