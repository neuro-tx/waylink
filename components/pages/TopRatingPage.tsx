"use client";

import { useEffect, useRef, useState } from "react";
import {
  useInView,
  motion,
  AnimatePresence,
  Variants,
  LayoutGroup,
} from "framer-motion";
import {
  Search,
  X,
  Sparkles,
  Plane,
  Compass,
  ChevronDown,
  LayoutGrid,
  List,
  StarOff,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Pagination, ProductCardProps } from "@/lib/all-types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { TopRatedCard } from "../TopRatedCard";
import { EmptyState, ErrorState, LoadMore } from "../StatesLayout";
import SkeletonGrid from "../Skeletons";
import { TopRatedURL } from "@/lib/url-builder";
import { Controller } from "react-hook-form";
import { useDebounce } from "@/hooks/useDebounce";

type ServiceFilter = "all" | "experience" | "transport";
type SortKey = "recommended" | "basePrice" | "-basePrice" | "bookings";

type ChipOption<T extends string> = {
  value: T;
  label: string;
  icon?: React.ElementType;
  accent: string;
};

const SERVICE_CHIPS: ChipOption<ServiceFilter>[] = [
  { value: "all", label: "All", icon: Sparkles, accent: "#845EF7" },
  {
    value: "experience",
    label: "Experiences",
    icon: Compass,
    accent: "#FF6B35",
  },
  { value: "transport", label: "Transport", icon: Plane, accent: "#3B9EFF" },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "recommended", label: "Best match" },
  { value: "-basePrice", label: "Price: Low → High" },
  { value: "basePrice", label: "Price: High → Low" },
  { value: "bookings", label: "Most popular" },
];

const gridVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

function ExploreHero() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <div className="pt-24 pb-15 relative overflow-hidden" ref={ref}>
      <motion.div
        className="absolute -top-40 left-1/4 w-125 h-125 rounded-full pointer-events-none bg-radial from-orange-3/15 to-transparent blur-3xl"
        animate={{ scale: [1, 1.1, 1], x: [0, 20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-20 right-1/4 w-96 h-96 rounded-full pointer-events-none bg-radial from-purple-500/12 to-transparent blur-[80px]"
        animate={{ scale: [1, 1.15, 1], x: [0, -15, 0] }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3,
        }}
      />
      <motion.div
        className="absolute top-1/2 -left-10 w-64 h-64 rounded-full pointer-events-none bg-radial from-green-1/10 to-transparent blur-[60px]"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5,
        }}
      />

      <svg className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none">
        <defs>
          <pattern
            id="dots"
            x="0"
            y="0"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1.2" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>

      <div className="mian-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center text-center gap-5"
        >
          <motion.div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/25 bg-purple-500/8 text-xs font-semibold text-purple-500 tracking-wide"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Explore Everything
          </motion.div>

          <h1 className="text-5xl md:text-[68px] leading-[1.08] font-extrabold font-georgia max-w-3xl">
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                delay: 0.15,
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="block"
            >
              The whole world,
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                delay: 0.28,
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="block bg-clip-text text-transparent bg-linear-135 from-orange-3 via-purple-500 to-blue-10"
            >
              one destination.
            </motion.span>
          </h1>

          <motion.p
            className="text-sm leading-relaxed max-w-md text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.42, duration: 0.6 }}
          >
            Experiences and transport across 120+ destinations — discover, book
            and go.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}

function Chip({
  label,
  icon: Icon,
  accent,
  active,
  onClick,
}: {
  label: string;
  icon?: React.ElementType;
  accent: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer select-none border",
        active
          ? "text-white border-transparent"
          : "text-muted-foreground border-border hover:text-foreground bg-transparent",
      )}
      style={
        active
          ? {
              background: accent,
              borderColor: accent,
              boxShadow: `0 4px 14px ${accent}45`,
            }
          : {}
      }
    >
      {active && (
        <motion.div
          layoutId={`chip-bg-${label}`}
          className="absolute inset-0 rounded-full"
          style={{ background: accent }}
          transition={{ type: "spring", stiffness: 340, damping: 28 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-1.5">
        {Icon && (
          <Icon
            className="w-3.5 h-3.5 shrink-0"
            style={{ color: active ? "#fff" : accent }}
          />
        )}
        {label}
      </span>
    </motion.button>
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

export default function TopRatingPageClient() {
  const [search, setSearch] = useState("");
  const [service, setService] = useState<ServiceFilter>("all");
  const [result, setResult] = useState<ProductCardProps[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [page, setPage] = useState(0);
  const [state, setState] = useState<"loading" | "data" | "empty" | "error">(
    "loading",
  );
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    limit: 0,
    offset: 0,
    page: 1,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const gridRef = useRef<HTMLDivElement>(null);
  const gridInView = useInView(gridRef, { once: true, margin: "-80px" });
  const debouncedSearch = useDebounce(search);

  const buildQuery = (p: number) =>
    TopRatedURL({
      search,
      limit: 12,
      page: p,
      service,
    });

  useEffect(() => {
    const controller = new AbortController();
    const getAll = async () => {
      try {
        setState("loading");
        const res = await fetch(buildQuery(1), { signal: controller.signal });
        if (!res.ok) throw new Error();
        const json = await res.json();
        const payload = json.data ?? json;

        const items: ProductCardProps[] = payload.data ?? [];
        if (items.length === 0) {
          setResult([]);
          setState("empty");
          return;
        }
        setResult(items);
        setPagination(payload.pagination);
        setPage(1);
        setState("data");
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setState("error");
        }
      }
    };

    getAll();
    return () => controller.abort();
  }, [debouncedSearch, retryKey, service]);

  const handleLoadMore = async () => {
    if (!pagination.hasNextPage) return;
    const next = page + 1;
    try {
      setLoadingMore(true);
      const res = await fetch(buildQuery(next));
      if (!res.ok) throw new Error();
      const json = await res.json();
      const payload = json.data ?? json;
      const items: ProductCardProps[] = payload.data ?? [];
      setResult((prev) => [...prev, ...items]);
      setPagination(payload.pagination);
      setPage(next);
      setState("data");
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setState("error");
      }
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen bg-waylink-fade font-sans">
      <ExploreHero />

      <motion.div
        className="sticky top-18 md:top-20 z-40"
        initial={{ y: -30, opacity: 0 }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          duration: 0.5,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <div className="mian-container py-3.5 flex flex-col md:flex-row gap-3 border rounded-xl border-border/70 backdrop-blur-2xl">
          <div className="w-full flex flex-col sm:flex-row sm:items-center gap-2.5">
            <div
              className={cn(
                "flex items-center gap-2 flex-1 px-3.5 py-2.5 rounded-xl border border-border bg-transparent overflow-hidden",
                search && "border-blue-500",
              )}
            >
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search experiences, routes, destinations…"
                className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
              />

              <AnimatePresence>
                {search && (
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setSearch("")}
                    className="text-muted-foreground hover:text-foreground p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex-1 flex items-center gap-2">
            <LayoutGroup id="service-tabs">
              {SERVICE_CHIPS.map((chip) => (
                <Chip
                  key={chip.value}
                  {...chip}
                  active={service === chip.value}
                  onClick={() => setService(chip.value)}
                />
              ))}
            </LayoutGroup>

            <div className="flex-1" />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              <span className="font-bold text-foreground mr-0.5">
                {result.length}
              </span>{" "}
              Results
            </span>
          </div>
        </div>
      </motion.div>

      <div className="mian-container px-4 py-10" ref={gridRef}>
        <AnimatePresence mode="wait">
          {state === "loading" && <SkeletonGrid type="topRated" />}

          {state === "empty" && (
            <EmptyState
              icon={<StarOff className="w-7 h-7 text-orange-3" />}
              title="No top rated products"
              message="Once travelers start leaving reviews, the highest rated will appear here."
            />
          )}

          {state === "error" && (
            <ErrorState
              icon={<AlertTriangle className="w-6 h-6 text-red-400" />}
              title="unavailable"
              message="We couldn't load any data right now. Please try again."
              buttonLabel="try again"
              onRetry={() => setRetryKey((k) => k + 1)}
            />
          )}

          {state === "data" && (
            <motion.div key={`${service}-grid`}>
              <motion.div
                variants={gridVariants}
                initial="hidden"
                animate={gridInView ? "visible" : "hidden"}
                className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
              >
                {result.map((product, i) => (
                  <motion.div
                    key={`${product.id}-${i}`}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      duration: 0.4,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <TopRatedCard product={product} key={i} />
                  </motion.div>
                ))}
              </motion.div>

              <LoadMore
                onClick={handleLoadMore}
                loading={loadingMore}
                pagination={pagination}
                color="orange"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
