"use client";

import { useRef, useState, useEffect } from "react";
import { useInView, motion, AnimatePresence, Variants } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  X,
  LayoutGrid,
  List,
  MapPin,
  Filter,
  ChevronDown,
  DollarSign,
} from "lucide-react";
import {
  Pagination,
  Transport,
  TransportClass,
  TransportType,
} from "@/lib/all-types";
import {
  CategoryFilter,
  TransportCard,
  TypeFilterStrip,
} from "@/components/Transport";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import transportUrlBuilder from "@/lib/url-builder";
import { useDebounce } from "@/hooks/useDebounce";
import SkeletonGrid, { TransportCardSkeleton } from "../Skeletons";
import { useClickOutside } from "@/hooks/useClickOut";
import { toast } from "sonner";

type SortKey =
  | "recommended"
  | "-basePrice"
  | "basePrice"
  | "-bookingsCount"
  | "-reviewsCount"
  | "-averageRating";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "-basePrice", label: "Price: High → Low" },
  { value: "basePrice", label: "Price: Low → High" },
  { value: "-bookingsCount", label: "Most Booked" },
  { value: "-reviewsCount", label: "Most Reviews" },
  { value: "-averageRating", label: "Most Rated" },
];

const CLASS_LABELS: Record<TransportClass, string> = {
  economy: "Economy",
  business: "Business",
  first_class: "First Class",
  premium_economy: "Premium",
  vip: "VIP",
};

const heroVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

const gridVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

function TransportHero() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  const stats = [
    { value: "1,200+", label: "Routes", accent: "#FF6B35" },
    { value: "98K+", label: "Bookings", accent: "#845EF7" },
    { value: "4.8★", label: "Avg Rating", accent: "#00C9A7" },
    { value: "80+", label: "Countries", accent: "#3B9EFF" },
  ];

  return (
    <div className="pt-24 pb-16 relative overflow-hidden">
      <motion.div
        className="absolute -top-32 -left-32 w-125 h-125 rounded-full pointer-events-none bg-radial from-orange-3/20 to-transparent blur-3xl"
        animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full pointer-events-none bg-radial from-blue-10/15 to-transparent blur-[70px]"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full pointer-events-none bg-radial from-green-1/12 to-transparent blur-[60px]"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
      <svg className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none">
        <defs>
          <pattern
            id="hero-grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" />
      </svg>

      <div className="mian-container relative z-10">
        <motion.div
          ref={ref}
          variants={heroVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="flex flex-col items-center text-center gap-6"
        >
          <div className="flex items-center gap-3">
            <motion.div
              className="h-px w-10 bg-linear-to-r from-transparent to-orange-3"
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            />
            <span className="text-xs font-bold tracking-[0.22em] uppercase text-orange-3">
              Transport
            </span>
            <motion.div
              className="h-px w-10 bg-linear-to-l from-transparent to-orange-3"
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            />
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold font-georgia">
            Move the World{" "}
            <motion.span
              initial={{ opacity: 0, x: -16 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="inline-block bg-clip-text text-transparent bg-linear-135 from-orange-3 via-blue-10 to-green-1"
            >
              Your Way.
            </motion.span>
          </h1>

          <p className="text-sm leading-relaxed max-w-lg text-muted-foreground">
            Flights, trains, ferries, private transfers and everything in
            between. Find the route that fits your pace.
          </p>

          <motion.div
            className="flex items-center gap-4 flex-wrap justify-center mt-2"
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {stats.map(({ value, label, accent }) => (
              <div key={label} className="flex items-center gap-2">
                <span
                  className="text-xl font-extrabold font-georgia"
                  style={{ color: accent }}
                >
                  {value}
                </span>
                <span className="text-xs text-gray-light">{label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function PriceRangeFilter({
  minPrice,
  maxPrice,
  onMinChange,
  onMaxChange,
}: {
  minPrice: number | undefined;
  maxPrice: number | undefined;
  onMinChange: (v: number | undefined) => void;
  onMaxChange: (v: number | undefined) => void;
}) {
  const parse = (raw: string) => {
    const n = parseFloat(raw);
    return isNaN(n) || n < 0 ? undefined : n;
  };

  const hasPrice = minPrice !== undefined || maxPrice !== undefined;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-gray-light flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-blue-10" />
          Price Range
        </p>
        {hasPrice && (
          <button
            type="button"
            onClick={() => {
              onMinChange(undefined);
              onMaxChange(undefined);
            }}
            className="text-[10px] text-orange-3 hover:underline cursor-pointer"
          >
            clear
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex items-center gap-1.5 flex-1 px-3 py-2 rounded-lg border text-xs transition-all duration-150",
            minPrice !== undefined
              ? "border-blue-10/50 bg-blue-10/8"
              : "border-border",
          )}
        >
          <span className="text-xs text-muted-foreground shrink-0">Min</span>
          <input
            type="number"
            min={0}
            value={minPrice ?? ""}
            onChange={(e) => onMinChange(parse(e.target.value))}
            placeholder="0.0"
            className="w-full placeholder:text-gray-light bg-transparent outline-none text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        <div className="h-px w-3 bg-border shrink-0" />

        <div
          className={cn(
            "flex items-center gap-1.5 flex-1 px-3 py-2 rounded-lg border text-xs transition-all duration-150",
            maxPrice !== undefined
              ? "border-blue-10/50 bg-blue-10/8"
              : "border-border",
          )}
        >
          <span className="text-xs text-muted-foreground shrink-0">Max</span>
          <input
            type="number"
            min={0}
            value={maxPrice ?? ""}
            onChange={(e) => onMaxChange(parse(e.target.value))}
            placeholder="∞"
            className="w-full bg-transparent placeholder:text-gray-light outline-none text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </div>

      <AnimatePresence>
        {hasPrice && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-[10px] text-blue-10 font-medium"
          >
            {minPrice !== undefined && maxPrice !== undefined
              ? `$${minPrice} – $${maxPrice}`
              : minPrice !== undefined
                ? `From $${minPrice}`
                : `Up to $${maxPrice}`}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

interface Filters {
  class: TransportClass | null;
  onlyDirect: boolean;
  onlyVerified: boolean;
}

const DEFAULT_FILTERS: Filters = {
  class: null,
  onlyDirect: false,
  onlyVerified: false,
};

function SidebarFilters({
  filters,
  onChange,
  onReset,
  minPrice,
  maxPrice,
  onMinPrice,
  onMaxPrice,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  onReset: () => void;
  minPrice: number | undefined;
  maxPrice: number | undefined;
  onMinPrice: (v: number | undefined) => void;
  onMaxPrice: (v: number | undefined) => void;
}) {
  const hasAny =
    filters.class !== null ||
    filters.onlyDirect ||
    filters.onlyVerified ||
    minPrice !== undefined ||
    maxPrice !== undefined;

  return (
    <div className="flex flex-col gap-5 p-5 rounded-2xl border box sticky top-24 font-sans shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase text-gray-light tracking-[0.15em] flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-10" />
          Filters
        </p>
        {hasAny && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-semibold px-2 py-0.5 rounded-lg text-orange-3 bg-orange-3/10 border border-orange-3/30 cursor-pointer hover:bg-orange-3/15 transition-colors"
          >
            Reset all
          </button>
        )}
      </div>

      <PriceRangeFilter
        minPrice={minPrice}
        maxPrice={maxPrice}
        onMinChange={onMinPrice}
        onMaxChange={onMaxPrice}
      />

      <div className="h-px bg-border/60" />

      <div className="flex flex-col gap-2.5">
        <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-gray-light">
          Class
        </p>
        <div className="flex flex-col gap-1.5">
          {(Object.entries(CLASS_LABELS) as [TransportClass, string][]).map(
            ([cls, label]) => {
              const active = filters.class === cls;
              return (
                <button
                  key={cls}
                  type="button"
                  onClick={() =>
                    onChange({ ...filters, class: active ? null : cls })
                  }
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-medium transition-all duration-150 cursor-pointer",
                    active
                      ? "bg-blue-10/12 border-blue-10/50 text-blue-10 hover:bg-blue-10/20"
                      : "bg-transparent text-muted-foreground hover:bg-accent",
                  )}
                >
                  {label}
                  <AnimatePresence>
                    {active && (
                      <motion.span
                        key="dot"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="w-2 h-2 rounded-full bg-blue-10 shrink-0"
                      />
                    )}
                  </AnimatePresence>
                </button>
              );
            },
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-gray-light">
          Options
        </p>
        {[
          { key: "onlyDirect" as const, label: "Direct routes only" },
          { key: "onlyVerified" as const, label: "Verified providers" },
        ].map(({ key, label }) => {
          const on = filters[key];
          return (
            <div
              key={key}
              className={cn(
                "flex items-center border gap-2.5 p-3 rounded-lg hover:bg-accent transition-all duration-200",
                on && "bg-blue-10/15 border-blue-10/50 hover:bg-blue-10/20",
              )}
            >
              <Switch
                checked={on}
                onCheckedChange={() => onChange({ ...filters, [key]: !on })}
                id={`filter-${key}`}
                className="data-[state=checked]:bg-blue-10"
              />
              <Label htmlFor={`filter-${key}`} className="cursor-pointer">
                {label}
              </Label>
            </div>
          );
        })}
      </div>

      <div className="h-px rounded-full bg-linear-to-r from-blue-10 via-orange-1/50 to-transparent" />

      {hasAny && (
        <p className="text-xs text-muted-foreground text-center">
          <span className="text-green-1">
            {[
              filters.class && CLASS_LABELS[filters.class],
              filters.onlyDirect && "direct",
              filters.onlyVerified && "verified",
              minPrice !== undefined && `min $${minPrice}`,
              maxPrice !== undefined && `max $${maxPrice}`,
            ]
              .filter(Boolean)
              .join(" · ")}
          </span>{" "}
          filter{hasAny ? "s" : ""} active
        </p>
      )}
    </div>
  );
}

function LoadMoreButton({
  loading,
  onClick,
  pagination,
}: {
  loading: boolean;
  onClick: () => void;
  pagination: Pagination;
}) {
  if (!pagination.hasNextPage) return null;

  const { page, totalPages } = pagination;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-3 pt-8 pb-2"
    >
      <div className="text-xs text-muted-foreground">
        Page {page} of {totalPages}
      </div>

      <motion.button
        type="button"
        onClick={onClick}
        disabled={loading}
        whileHover={!loading ? { scale: 1.01, y: -1 } : undefined}
        whileTap={!loading ? { scale: 0.98 } : undefined}
        className={cn(
          "relative flex items-center gap-2.5 px-7 py-2.5 rounded-2xl border text-sm font-semibold overflow-hidden transition-all duration-200",
          loading
            ? "text-muted-foreground border-border cursor-not-allowed"
            : "text-blue-10 border-blue-10/40 bg-blue-10/8 hover:bg-blue-10/14 cursor-pointer",
        )}
      >
        {loading && (
          <motion.div
            className="absolute inset-0 bg-linear-to-r from-transparent via-blue-10/6 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        )}

        {loading ? (
          <>
            <motion.div
              className="w-4 h-4 rounded-full border-2 border-blue-10/30 border-t-blue-10 shrink-0"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
            Loading more…
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4" />
            Load more routes
          </>
        )}
      </motion.button>
    </motion.div>
  );
}

function SortDropdown({
  value,
  onChange,
}: {
  value: SortKey;
  onChange: (value: SortKey) => void;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as SortKey)}>
      <SelectTrigger className="w-full max-w-48">
        <SelectValue placeholder="Sort..." />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export default function TransportPageClient() {
  const [typeFilter, setTypeFilter] = useState<TransportType | "all">("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("recommended");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [results, setResults] = useState<Transport[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    limit: 0,
    offset: 0,
    page: 1,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const sideBarRef = useRef<HTMLDivElement | null>(null);

  const debounceSearch = useDebounce(search);
  const gridRef = useRef<HTMLDivElement>(null);
  const gridInView = useInView(gridRef, { once: true, margin: "-60px" });
  const debounceMinPrice = useDebounce(minPrice);
  const debounceMaxPrice = useDebounce(maxPrice);
  const { onlyVerified, onlyDirect, class: transportClass } = filters;

  const buildQuery = (p: number) =>
    transportUrlBuilder({
      search: debounceSearch,
      limit: 20,
      sort,
      page: p,
      maxPrice,
      minPrice,
      type: typeFilter,
      verified: filters.onlyVerified,
      directRoute: filters.onlyDirect,
      transportClass: filters.class ?? undefined,
    });

  useEffect(() => {
    const controller = new AbortController();

    const run = async () => {
      setLoading(true);
      try {
        const res = await fetch(buildQuery(1), {
          signal: controller.signal,
        });

        if (!res.ok) throw new Error();
        const json = await res.json();
        const payload = json.data ?? json;

        setResults(payload.data ?? []);
        setPagination(payload.pagination);
        setPage(1);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    };

    run();

    return () => controller.abort();
  }, [
    debounceSearch,
    sort,
    typeFilter,
    onlyVerified,
    onlyDirect,
    transportClass,
    debounceMinPrice,
    debounceMaxPrice,
  ]);

  const handleLoadMore = async () => {
    if (!pagination.hasNextPage) return;
    const next = page + 1;
    setLoadingMore(true);
    try {
      const res = await fetch(buildQuery(next));
      if (!res.ok) throw new Error();
      const json = await res.json();
      const payload = json.data ?? json;
      const items: Transport[] = payload.data ?? [];
      setResults((prev) => [...prev, ...items]);
      setPagination(payload.pagination);
      setPage(next);
    } catch {
      toast.error("Failed to load more routes");
    } finally {
      setLoadingMore(false);
    }
  };

  const resetAll = () => {
    setSearch("");
    setTypeFilter("all");
    setFilters(DEFAULT_FILTERS);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setSort("recommended");
  };

  const activeFilterCount = [
    filters.class !== null,
    filters.onlyDirect,
    filters.onlyVerified,
    minPrice !== undefined,
    maxPrice !== undefined,
  ].filter(Boolean).length;

  useClickOutside(sideBarRef, () => setSidebarOpen(false));

  return (
    <div className="min-h-screen bg-waylink-fade duration-500 font-sans">
      <TransportHero />

      <div className="sticky top-18 z-40 border-y py-4 backdrop-blur-lg">
        <div className="mian-container">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-full md:min-w-50 px-3.5 py-2 rounded-xl border transition-all duration-200 overflow-hidden">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search routes, cities..."
                className="w-full text-sm bg-transparent placeholder:text-gray-light outline-none"
              />
              <AnimatePresence>
                {search && (
                  <motion.button
                    type="button"
                    onClick={() => setSearch("")}
                    whileTap={{ scale: 0.9 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="text-muted-foreground hover:text-foreground p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-3 flex-nowrap">
              <SortDropdown value={sort} onChange={setSort} />

              <TypeFilterStrip
                active={typeFilter}
                onChange={setTypeFilter}
                className="md:hidden"
              />

              <Button
                variant="outline"
                type="button"
                onClick={() => setSidebarOpen((v) => !v)}
                className={cn(
                  "lg:hidden",
                  activeFilterCount > 0 &&
                    "border-blue-10/50 text-blue-10 bg-blue-10/10",
                )}
              >
                <SlidersHorizontal className="w-3 h-3" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-10 text-white leading-none">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </div>

            <div className="hidden sm:flex items-center gap-0.5 p-1 px-2 rounded-xl border">
              {(["grid", "list"] as const).map((v) => (
                <Button
                  key={v}
                  size="icon-sm"
                  variant="ghost"
                  className={cn(
                    viewMode === v
                      ? "bg-purple-500 hover:bg-purple-600! text-white!"
                      : "bg-transparent",
                  )}
                  onClick={() => setViewMode(v)}
                >
                  {v === "grid" ? (
                    <LayoutGrid className="w-4 h-4" />
                  ) : (
                    <List className="w-4 h-4" />
                  )}
                </Button>
              ))}
            </div>

            <div className="hidden md:flex items-center justify-center">
              <CategoryFilter active={typeFilter} onChange={setTypeFilter} />
            </div>

            <span className="text-xs text-muted-foreground ml-auto hidden md:block">
              {loading ? (
                <span className="text-blue-10/60 animate-pulse">Fetching…</span>
              ) : (
                <span className="text-xs font-medium text-muted-foreground space-x-0.5">
                  <span className="font-semibold text-orange-3 underline">
                    {results.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-foreground mx-0.5">
                    {pagination.total}
                  </span>{" "}
                  results
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="mian-container px-4 py-10">
        <div className="flex gap-6 items-start">
          <div className="hidden lg:block w-64 shrink-0">
            <SidebarFilters
              filters={filters}
              onChange={setFilters}
              onReset={resetAll}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinPrice={setMinPrice}
              onMaxPrice={setMaxPrice}
            />
          </div>

          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 z-50 flex"
              >
                <motion.div className="absolute inset-0 bg-black/30 backdrop-blur-xs" />
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", stiffness: 280, damping: 28 }}
                  className="relative z-10 w-72 h-full overflow-y-auto p-4 pt-6 bg-waylink-fade border-r"
                  ref={sideBarRef}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-base font-bold font-georgia">
                      Filters
                    </span>
                    <button type="button" onClick={() => setSidebarOpen(false)}>
                      <X className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                    </button>
                  </div>
                  <SidebarFilters
                    filters={filters}
                    onChange={setFilters}
                    onReset={() => {
                      resetAll();
                      setSidebarOpen(false);
                    }}
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    onMinPrice={setMinPrice}
                    onMaxPrice={setMaxPrice}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 min-w-0" ref={gridRef}>
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <SkeletonGrid type="transport" />
                </motion.div>
              ) : results.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-24 gap-3 border-2 border-dashed border-orange-3/50 rounded-lg"
                >
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center border border-blue-10/30 bg-blue-10/10">
                    <MapPin className="w-7 h-7 text-blue-10" />
                  </div>
                  <p className="text-xl tracking-wider font-bold font-georgia">
                    No routes found
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your filters or search term.
                  </p>
                  <Button variant="outline" onClick={resetAll}>
                    <X className="w-3.5 h-3.5" />
                    Clear filters
                  </Button>
                </motion.div>
              ) : (
                <motion.div key={`${typeFilter}-${viewMode}`}>
                  <motion.div
                    variants={gridVariants}
                    initial="hidden"
                    animate={gridInView ? "visible" : "hidden"}
                    className={
                      viewMode === "grid"
                        ? "grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
                        : "flex flex-col gap-4"
                    }
                  >
                    <>
                      {results.map((product, i) => (
                        <motion.div
                          key={`transport-card-${i}`}
                          layout
                          initial={{ opacity: 0, y: 20, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{
                            duration: 0.4,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                        >
                          <TransportCard product={product} />
                        </motion.div>
                      ))}

                      {loadingMore && <LoadingGrid count={3} />}

                      <LoadMoreButton
                        loading={loadingMore}
                        onClick={handleLoadMore}
                        pagination={pagination}
                      />
                    </>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingGrid({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div key={`skeleton-${i}`} layout>
          <TransportCardSkeleton />
        </motion.div>
      ))}
    </>
  );
}
