"use client";

import { useRef, useState, useEffect } from "react";
import { useInView, motion, AnimatePresence, Variants } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  X,
  LayoutGrid,
  List,
  Filter,
  DollarSign,
  Compass,
  Flame,
  Landmark,
  Music2,
  UtensilsCrossed,
  Dumbbell,
  Leaf,
  Waves,
  PawPrint,
  Camera,
  TreePine,
  ShoppingBag,
  Moon,
  GraduationCap,
  Snowflake,
  AlertCircle,
} from "lucide-react";
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
import { useDebounce } from "@/hooks/useDebounce";
import {
  ExperienceType,
  DifficultyLevel,
  ProductCardProps,
  Pagination,
} from "@/lib/all-types";
import { experienceUrlBuilder } from "@/lib/url-builder";
import SkeletonGrid, { ExperienceCardSkeleton } from "../Skeletons";
import { ProductCard } from "../Product";
import { useClickOutside } from "@/hooks/useClickOut";
import { EmptyState, ErrorState, LoadMore } from "../StatesLayout";

interface Filters {
  difficulty: DifficultyLevel | null;
  onlyVerified: boolean;
}

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

const TYPE_TABS: {
  value: ExperienceType | "all";
  label: string;
  icon: React.ElementType;
  accent: string;
}[] = [
  { value: "all", label: "All", icon: LayoutGrid, accent: "#845EF7" },
  { value: "tour", label: "Tours", icon: Compass, accent: "#FF6B35" },
  { value: "adventure", label: "Adventure", icon: Flame, accent: "#FF4757" },
  { value: "cultural", label: "Cultural", icon: Landmark, accent: "#845EF7" },
  {
    value: "entertainment",
    label: "Entertainment",
    icon: Music2,
    accent: "#F7B731",
  },
  {
    value: "food_drink",
    label: "Food & Drink",
    icon: UtensilsCrossed,
    accent: "#FF6B35",
  },
  { value: "sports", label: "Sports", icon: Dumbbell, accent: "#3B9EFF" },
  { value: "wellness", label: "Wellness", icon: Leaf, accent: "#00C9A7" },
  { value: "water", label: "Water", icon: Waves, accent: "#3B9EFF" },
  { value: "wildlife", label: "Wildlife", icon: PawPrint, accent: "#00C9A7" },
  {
    value: "photography",
    label: "Photography",
    icon: Camera,
    accent: "#845EF7",
  },
  { value: "nature", label: "Nature", icon: TreePine, accent: "#00C9A7" },
  {
    value: "shopping",
    label: "Shopping",
    icon: ShoppingBag,
    accent: "#FF6B35",
  },
  { value: "nightlife", label: "Nightlife", icon: Moon, accent: "#845EF7" },
  {
    value: "learning",
    label: "Learning",
    icon: GraduationCap,
    accent: "#3B9EFF",
  },
  { value: "seasonal", label: "Seasonal", icon: Snowflake, accent: "#3B9EFF" },
];

const DIFFICULTY_CONFIG: Record<
  DifficultyLevel,
  { label: string; color: string }
> = {
  easy: { label: "Easy", color: "#00C9A7" },
  moderate: { label: "Moderate", color: "#3B9EFF" },
  challenging: { label: "Challenging", color: "#FF6B35" },
  extreme: { label: "Extreme", color: "#FF4757" },
};

const DEFAULT_FILTERS: Filters = { difficulty: null, onlyVerified: false };

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

function ExperienceHero() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  const stats = [
    { value: "4,800+", label: "Experiences", accent: "#FF6B35" },
    { value: "120+", label: "Destinations", accent: "#845EF7" },
    { value: "4.9★", label: "Avg Rating", accent: "#00C9A7" },
    { value: "98K+", label: "Travellers", accent: "#3B9EFF" },
  ];

  return (
    <div className="pt-24 pb-16 relative overflow-hidden">
      <motion.div
        className="absolute -top-32 -right-32 w-125 h-125 rounded-full pointer-events-none bg-radial from-orange-3/20 to-transparent blur-3xl"
        animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full pointer-events-none bg-radial from-purple-500/10 to-transparent blur-[70px]"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full pointer-events-none bg-radial from-green-1/10 to-transparent blur-[60px]"
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
            id="exp-grid"
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
        <rect width="100%" height="100%" fill="url(#exp-grid)" />
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
              Experiences
            </span>
            <motion.div
              className="h-px w-10 bg-linear-to-l from-transparent to-orange-3"
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            />
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold font-georgia">
            Live Moments{" "}
            <motion.span
              initial={{ opacity: 0, x: -16 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="inline-block bg-clip-text text-transparent bg-linear-135 from-rose-500 via-amber-400 to-violet-500"
            >
              Worth Telling.
            </motion.span>
          </h1>

          <p className="text-sm leading-relaxed max-w-lg text-muted-foreground">
            Guided tours, wild adventures, cultural deep-dives, food journeys
            and more — handpicked by locals and loved by travellers everywhere.
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

function TypeFilterStrip({
  active,
  onChange,
}: {
  active: ExperienceType | "all";
  onChange: (v: ExperienceType | "all") => void;
}) {
  return (
    <Select
      value={active}
      onValueChange={(v) => onChange(v as ExperienceType | "all")}
    >
      <SelectTrigger className="w-full max-w-52">
        <SelectValue placeholder="All types" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {TYPE_TABS.map((tab) => (
            <SelectItem key={tab.value} value={tab.value}>
              <div className="flex items-center gap-2">
                <tab.icon
                  className="w-3.5 h-3.5 shrink-0"
                  style={{ color: tab.accent }}
                />
                {tab.label}
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
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
          <DollarSign className="w-3.5 h-3.5 text-orange-3" />
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
            "flex items-center gap-1.5 flex-1 px-3 py-2 rounded-xl border text-xs transition-all duration-150",
            minPrice !== undefined
              ? "border-orange-3/50 bg-orange-3/8"
              : "border-border",
          )}
        >
          <span className="text-[10px] text-gray-light shrink-0">Min</span>
          <input
            type="number"
            min={0}
            value={minPrice ?? ""}
            onChange={(e) => onMinChange(parse(e.target.value))}
            placeholder="0"
            className="w-full bg-transparent outline-none text-xs placeholder:text-gray-light/60 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
        <div className="h-px w-3 bg-border shrink-0" />
        <div
          className={cn(
            "flex items-center gap-1.5 flex-1 px-3 py-2 rounded-xl border text-xs transition-all duration-150",
            maxPrice !== undefined
              ? "border-orange-3/50 bg-orange-3/8"
              : "border-border",
          )}
        >
          <span className="text-[10px] text-gray-light shrink-0">Max</span>
          <input
            type="number"
            min={0}
            value={maxPrice ?? ""}
            onChange={(e) => onMaxChange(parse(e.target.value))}
            placeholder="∞"
            className="w-full bg-transparent outline-none text-xs placeholder:text-gray-light/60 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </div>

      <AnimatePresence>
        {hasPrice && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-[10px] text-orange-3 font-medium"
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
    filters.difficulty !== null ||
    filters.onlyVerified ||
    minPrice !== undefined ||
    maxPrice !== undefined;

  return (
    <div className="flex flex-col gap-5 p-5 rounded-2xl border box sticky top-24 font-sans shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase text-gray-light tracking-[0.15em] flex items-center gap-2">
          <Filter className="w-4 h-4 text-orange-3" />
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

      {/* Difficulty — single select, click again to deselect */}
      <div className="flex flex-col gap-2.5">
        <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-gray-light">
          Difficulty
        </p>
        <div className="flex flex-col gap-1.5">
          {(
            Object.entries(DIFFICULTY_CONFIG) as [
              DifficultyLevel,
              { label: string; color: string },
            ][]
          ).map(([level, { label, color }]) => {
            const active = filters.difficulty === level;
            return (
              <button
                key={level}
                type="button"
                onClick={() =>
                  onChange({ ...filters, difficulty: active ? null : level })
                }
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-medium transition-all duration-150 cursor-pointer",
                  active
                    ? "border-opacity-50 text-white hover:opacity-90"
                    : "bg-transparent text-muted-foreground hover:bg-accent border-border",
                )}
                style={active ? { background: color, borderColor: color } : {}}
              >
                <div className="flex items-center gap-2">
                  {/* Colour dot */}
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      background: active ? "rgba(255,255,255,0.6)" : color,
                    }}
                  />
                  {label}
                </div>
                <AnimatePresence>
                  {active && (
                    <motion.span
                      key="check"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="text-[10px] font-bold opacity-80"
                    >
                      ✓
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </div>
      </div>

      {/* Options toggles */}
      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-gray-light">
          Options
        </p>
        <div
          className={cn(
            "flex items-center border gap-2.5 p-3 rounded-lg hover:bg-accent transition-all duration-200",
            filters.onlyVerified &&
              "bg-orange-3/10 border-orange-3/40 hover:bg-orange-3/15",
          )}
        >
          <Switch
            checked={filters.onlyVerified}
            onCheckedChange={() =>
              onChange({ ...filters, onlyVerified: !filters.onlyVerified })
            }
            id="filter-verified"
            className="data-[state=checked]:bg-orange-3"
          />
          <Label htmlFor="filter-verified" className="cursor-pointer">
            Verified providers
          </Label>
        </div>
      </div>

      {/* Gradient rule */}
      <div className="h-px rounded-full bg-linear-to-r from-orange-3 via-purple-500/50 to-transparent" />

      {/* Active summary */}
      {hasAny && (
        <p className="text-xs text-muted-foreground text-center">
          <span className="text-orange-3">
            {[
              filters.difficulty && DIFFICULTY_CONFIG[filters.difficulty].label,
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

export default function ExperiencePageClient() {
  const [typeFilter, setTypeFilter] = useState<ExperienceType | "all">("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("recommended");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [results, setResults] = useState<ProductCardProps[]>([]);
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

  const debounceSearch = useDebounce(search);
  const debounceMinPrice = useDebounce(minPrice);
  const debounceMaxPrice = useDebounce(maxPrice);
  const gridRef = useRef<HTMLDivElement>(null);
  const gridInView = useInView(gridRef, { once: true, margin: "-60px" });
  const sideBarRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<"loading" | "data" | "empty" | "error">(
    "loading",
  );
  const [retryKey, setRetryKey] = useState(0);

  const buildQuery = (p: number) =>
    experienceUrlBuilder({
      search: debounceSearch,
      limit: 20,
      sort,
      page: p,
      maxPrice,
      minPrice,
      expType: typeFilter,
      verified: filters.onlyVerified,
      difficulty: filters.difficulty ?? undefined,
    });

  useEffect(() => {
    const controller = new AbortController();

    const run = async () => {
      setState("loading");
      try {
        const res = await fetch(buildQuery(1), {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error();
        const json = await res.json();
        const payload = json.data ?? json;

        const items: ProductCardProps[] = payload.data ?? [];
        if (items.length === 0) {
          setState("empty");
          return;
        }
        setResults(payload.data ?? []);
        setPagination(payload.pagination);
        setPage(1);
        setState("data");
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setState("error");
        }
      }
    };
    run();

    return () => controller.abort();
  }, [
    debounceSearch,
    sort,
    typeFilter,
    filters,
    debounceMaxPrice,
    debounceMinPrice,
    retryKey,
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
      const items: ProductCardProps[] = payload.data ?? [];
      if (items.length === 0) {
        setState("empty");
        return;
      }
      setResults((prev) => [...prev, ...items]);
      setPagination(payload.pagination);
      setPage(next);
      setState("data");
    } catch {
      setState("error");
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
    filters.difficulty !== null,
    filters.onlyVerified,
    minPrice !== undefined,
    maxPrice !== undefined,
  ].filter(Boolean).length;

  useClickOutside(sideBarRef, () => setSidebarOpen(false));

  return (
    <div className="min-h-screen bg-waylink-fade duration-500 font-sans">
      <ExperienceHero />

      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="sticky top-18 md:top-20 z-40"
      >
        <div className="mian-container border backdrop-blur-lg py-4 rounded-xl">
          <motion.div
            className="flex items-center gap-3 flex-wrap"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.05 },
              },
            }}
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
              className={cn(
                "flex items-center gap-2 flex-1 min-w-full md:min-w-50 px-3.5 py-2 rounded-xl border transition-all duration-200 overflow-hidden",
                search && "border-orange-3/50",
              )}
            >
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search experiences, destinations..."
                className="flex-1 text-sm bg-transparent placeholder:text-gray-light outline-none"
              />

              <AnimatePresence>
                {search && (
                  <motion.button
                    type="button"
                    onClick={() => setSearch("")}
                    whileTap={{ scale: 0.85 }}
                    whileHover={{ scale: 1.1 }}
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.15 }}
                    className="text-muted-foreground hover:text-foreground p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <SortDropdown value={sort} onChange={setSort} />
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <Button
                variant="outline"
                type="button"
                onClick={() => setSidebarOpen((v) => !v)}
                className={cn(
                  "lg:hidden",
                  activeFilterCount > 0 &&
                    "border-orange-3/50 text-orange-3 bg-orange-3/10",
                )}
              >
                <SlidersHorizontal className="w-3 h-3" />
                Filters
                <AnimatePresence>
                  {activeFilterCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-3 text-white leading-none"
                    >
                      {activeFilterCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <TypeFilterStrip active={typeFilter} onChange={setTypeFilter} />
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
              className="hidden sm:flex items-center gap-0.5 p-1 px-2 rounded-xl border"
            >
              {(["grid", "list"] as const).map((v) => (
                <Button
                  size="icon-sm"
                  key={v}
                  variant="ghost"
                  className={cn(
                    viewMode === v
                      ? "bg-orange-3 hover:bg-orange-3/90! text-white!"
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
            </motion.div>

            <motion.span
              layout
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
              className="text-xs text-muted-foreground ml-auto hidden sm:block"
            >
              <AnimatePresence mode="wait">
                {state === "loading" ? (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-orange-3/60 animate-pulse"
                  >
                    Fetching…
                  </motion.span>
                ) : (
                  <motion.span
                    key="results"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs font-medium text-muted-foreground space-x-0.5"
                  >
                    <span className="font-semibold text-orange-3">
                      {results.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-foreground mx-0.5">
                      {pagination.total}
                    </span>{" "}
                    results
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.span>
          </motion.div>
        </div>
      </motion.div>

      <div className="mian-container px-4 py-10">
        <div className="flex gap-6 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="hidden lg:block w-64 shrink-0"
          >
            <SidebarFilters
              filters={filters}
              onChange={setFilters}
              onReset={resetAll}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinPrice={setMinPrice}
              onMaxPrice={setMaxPrice}
            />
          </motion.div>

          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 z-50 flex"
              >
                <motion.div className="absolute inset-0 bg-black/40 backdrop-blur-xs" />
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
            {state === "loading" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
              >
                <SkeletonGrid type="experince" />
              </motion.div>
            )}

            {state === "error" && (
              <ErrorState
                icon={<AlertCircle className="w-6 h-6 text-red-400" />}
                title="Experiences failed to load"
                message="Something went wrong while loading experiences. Please try again."
                buttonLabel="Try again"
                onRetry={() => setRetryKey((k) => k + 1)}
              />
            )}

            {state === "empty" && (
              <EmptyState
                icon={<Compass className="w-7 h-7 text-orange-3" />}
                title="No experiences found"
                message="Try adjusting your filters."
                action={
                  <Button variant="outline" size="sm" onClick={resetAll}>
                    Clear filters
                  </Button>
                }
              />
            )}

            {state === "data" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
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
                  {results.map((product) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, y: 16, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}

                  {loadingMore && <LoadingGrid count={3} />}
                </motion.div>

                <LoadMore
                  loading={loadingMore}
                  onClick={handleLoadMore}
                  pagination={pagination}
                />
              </motion.div>
            )}
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
          <ExperienceCardSkeleton />
        </motion.div>
      ))}
    </>
  );
}
