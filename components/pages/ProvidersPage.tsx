"use client";

import { useRef, useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  Variants,
  useInView,
  LayoutGroup,
} from "framer-motion";
import {
  Search,
  Users,
  Plane,
  Compass,
  ChevronDown,
  User,
  Building2,
  Briefcase,
  RefreshCcw,
  ArrowDown,
  Loader,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BusinessType,
  Pagination,
  ServiceType,
  SpotlightProvider,
} from "@/lib/all-types";
import { ProviderCard } from "../ProviderCard";
import { Input } from "../ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { providerUrl } from "@/lib/url-builder";
import SkeletonGrid from "../Skeletons";
import { Button } from "../ui/button";
import { toast } from "sonner";

type ServiceFilter = "all" | ServiceType;
type BusinessFilter = "all" | BusinessType;

type ChipOpt<T extends string> = {
  value: T;
  label: string;
  icon?: React.ElementType;
  accent: string;
};

const SERVICE_CHIPS: ChipOpt<ServiceFilter>[] = [
  { value: "all", label: "All", accent: "#845EF7" },
  {
    value: "experience",
    label: "Experiences",
    icon: Compass,
    accent: "#FF6B35",
  },
  { value: "transport", label: "Transport", icon: Plane, accent: "#3B9EFF" },
];

const BUSINESS_CHIPS: ChipOpt<BusinessFilter>[] = [
  { value: "all", label: "All", accent: "#845EF7" },
  { value: "individual", label: "Individual", icon: User, accent: "#22C55E" },
  { value: "company", label: "Company", icon: Building2, accent: "#3B82F6" },
  { value: "agency", label: "Agency", icon: Briefcase, accent: "#F59E0B" },
];

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
  },
};

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
      whileTap={{ scale: 0.93 }}
      className={cn(
        "relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer select-none border",
        active
          ? "text-white border-transparent"
          : "text-muted-foreground border-border hover:text-foreground",
      )}
      style={
        active
          ? {
              background: accent,
              borderColor: accent,
              boxShadow: `0 4px 14px ${accent}38`,
            }
          : {}
      }
    >
      <span className="relative z-10 flex items-center gap-1.5">
        {Icon && (
          <Icon
            className="w-3 h-3 shrink-0"
            style={{ color: active ? "#fff" : accent }}
          />
        )}
        {label}
      </span>
    </motion.button>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 px-3.5 py-2.5 rounded-xl border border-border/60 bg-muted/30 w-full md:w-fit">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/70">
        {label}
      </p>
      <div className="flex items-center gap-2 flex-wrap">{children}</div>
    </div>
  );
}

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <div className="relative overflow-hidden pt-25 pb-10" ref={ref}>
      <motion.div
        className="absolute top-0 right-0 w-105 h-105 rounded-full pointer-events-none bg-radial from-purple-500/14 to-transparent blur-3xl"
        animate={{ scale: [1, 1.1, 1], y: [0, -18, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-10 left-1/3 w-80 h-80 rounded-full pointer-events-none bg-radial from-orange-3/12 to-transparent blur-[70px]"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      <div className="mian-container relative z-10">
        <motion.div
          className="flex flex-col gap-5"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full border border-green-1/25 bg-green-1/8 text-xs font-semibold text-green-1 tracking-wide"
          >
            <Users className="w-3.5 h-3.5" />
            Travel Providers
          </motion.div>

          <div>
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                delay: 0.15,
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="text-5xl md:text-6xl leading-[1.1] font-extrabold font-georgia"
            >
              Meet the people
            </motion.h1>
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                delay: 0.25,
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="text-5xl md:text-6xl leading-[1.1] font-extrabold font-georgia bg-clip-text text-transparent bg-linear-135 from-green-1 to-blue-10 w-fit"
            >
              behind every trip.
            </motion.h1>
          </div>

          <motion.div
            className="flex flex-col sm:flex-row sm:items-end gap-6"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.38, duration: 0.6 }}
          >
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Browse our network of verified operators, guides and transport
              companies — each reviewed by real travellers.
            </p>

            <div className="flex items-center gap-3 flex-wrap">
              {[
                { value: "2500+", label: "Providers" },
                { value: "120+", label: "Destinations" },
                { value: "98%", label: "Satisfaction" },
              ].map(({ value, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center px-5 py-2.5 rounded-xl border border-border bg-card"
                >
                  <span className="text-base font-extrabold text-foreground tabular-nums">
                    {value}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default function ProvidersPageClient() {
  const [search, setSearch] = useState("");
  const [service, setService] = useState<ServiceFilter>("all");
  const [business, setBusiness] = useState<BusinessFilter>("all");
  const [results, setResults] = useState<SpotlightProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [open, setOpen] = useState(true);
  const [page, setPage] = useState(1);
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

  const gridRef = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebounce(search);

  const buildQuery = (p: number) => {
    return providerUrl({
      search: debouncedSearch,
      business,
      service,
      status: "approved",
      page: p,
      limit: 12,
    });
  };

  useEffect(() => {
    const controller = new AbortController();
    const fetchProviders = async () => {
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
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
    return () => controller.abort();
  }, [debouncedSearch, service, business, retryKey]);

  const loadMore = async () => {
    if (!pagination.hasNextPage) return;
    const next = page + 1;
    setLoadingMore(true);
    try {
      const res = await fetch(buildQuery(next));
      if (!res.ok) throw new Error();
      const json = await res.json();
      const payload = json.data ?? json;
      const items: SpotlightProvider[] = payload.data ?? [];
      setResults((prev) => [...prev, ...items]);
      setPagination(payload.pagination);
      setPage(next);
    } catch (error) {
      toast.error("Failed to load more providers.");
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen bg-waylink-fade font-sans">
      <Hero />

      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="sticky top-18 md:top-20 z-40"
      >
        <div className="mian-container py-3.5 flex flex-col gap-3 border border-border/70 backdrop-blur-lg bg-background/75 rounded-2xl shadow-sm">
          <div className="w-full flex items-center gap-2 flex-nowrap">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search providers, destinations…"
                className="w-full text-sm pl-8 pr-3"
              />
            </div>
            <Button
              size="icon"
              variant="outline"
              onClick={() => setOpen((v) => !v)}
            >
              <ArrowDown
                className={cn(
                  open && "rotate-180 transition-transform duration-200",
                )}
              />
            </Button>
          </div>

          <AnimatePresence mode="wait">
            {open && (
              <motion.div
                key="dropdown-filter-menu"
                initial={{ opacity: 0, height: 0, y: -8 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -8 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center gap-3 pt-1">
                  <FilterGroup label="Service">
                    <LayoutGroup id="provider-service">
                      {SERVICE_CHIPS.map((c) => (
                        <Chip
                          key={c.value}
                          {...c}
                          active={service === c.value}
                          onClick={() => setService(c.value)}
                        />
                      ))}
                    </LayoutGroup>
                  </FilterGroup>

                  <FilterGroup label="Provider type">
                    <LayoutGroup id="provider-business-type">
                      {BUSINESS_CHIPS.map((c) => (
                        <Chip
                          key={c.value}
                          {...c}
                          active={business === c.value}
                          onClick={() => setBusiness(c.value)}
                        />
                      ))}
                    </LayoutGroup>
                  </FilterGroup>

                  {!loading && !error && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.15 }}
                      className="hidden md:block ml-auto text-xs text-muted-foreground shrink-0"
                    >
                      <span className="font-bold text-foreground">
                        {results.length}
                      </span>{" "}
                      providers
                    </motion.span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <div className="mian-container py-10" ref={gridRef}>
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <SkeletonGrid type="provider" />
            </motion.div>
          )}

          {!loading && error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-28 gap-4 border border-dashed border-red-500/20 rounded-2xl"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-red-500/8 border border-red-500/20">
                <RefreshCcw className="w-6 h-6 text-red-400" />
              </div>
              <p className="text-lg font-bold font-georgia text-red-400">
                Something went wrong
              </p>
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                Could not load providers. Check your connection and try again.
              </p>
              <motion.button
                type="button"
                onClick={() => setRetryKey((k) => k + 1)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-500/25 text-red-400 bg-red-500/8 text-sm font-semibold cursor-pointer hover:bg-red-500/14 transition-all"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                Try again
              </motion.button>
            </motion.div>
          )}

          {!loading && !error && results.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-28 gap-3 border border-dashed border-orange-3/25 rounded-2xl"
            >
              <motion.div
                className="w-16 h-16 rounded-2xl flex items-center justify-center bg-orange-3/10 border border-orange-3/25"
                animate={{ y: [0, -5, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Users className="w-7 h-7 text-orange-3" />
              </motion.div>
              <p className="text-xl font-bold font-georgia">
                No providers found
              </p>
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                Try searching a different name.
              </p>
            </motion.div>
          )}

          {!loading && !error && results.length > 0 && (
            <motion.div key={`${service}-${business}`} layout>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
              >
                {results.map((provider) => (
                  <motion.div key={provider.id} variants={itemVariants}>
                    <ProviderCard provider={provider} />
                  </motion.div>
                ))}
              </motion.div>

              {pagination.hasNextPage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex justify-center pt-10"
                >
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl border border-orange-3/30 text-orange-3 bg-orange-3/8 hover:bg-orange-3/14 text-sm font-medium cursor-pointer transition-all"
                    onClick={loadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Loading more…
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Show more providers
                      </>
                    )}
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
