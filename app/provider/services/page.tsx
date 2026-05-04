"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  LayoutGrid,
  List,
  Plus,
  Download,
  SlidersHorizontal,
  ToggleRight,
  TrendingUp,
  DollarSign,
  Package,
  BookOpen,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  ProductProps,
  ServiceGridCard,
  ServiceListRow,
} from "../_components/ProductLayout";
import { useProviderContext } from "@/components/providers/ProviderContext";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { serviceUrl } from "@/lib/url-builder";

type SortKey =
  | "all"
  | "-basePrice"
  | "basePrice"
  | "-bookingsCount"
  | "-reviewsCount"
  | "-averageRating";

type Status = "all" | "draft" | "active" | "paused" | "archived";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "all", label: "View All" },
  { value: "-basePrice", label: "Price: High → Low" },
  { value: "basePrice", label: "Price: Low → High" },
  { value: "-bookingsCount", label: "Most Booked" },
  { value: "-reviewsCount", label: "Most Reviews" },
  { value: "-averageRating", label: "Most Rated" },
];

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "all", label: "View status" },
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "archived", label: "Archived" },
];

type Option<T> = {
  value: T;
  label?: string;
};

type SortDropdownProps<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  options: Option<T>[];
  placeholder?: string;
};

function SortDropdown<T extends string>({
  value,
  onChange,
  options,
  placeholder = "Sort...",
}: SortDropdownProps<T>) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as T)}>
      <SelectTrigger className="w-full max-w-48">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent>
        <SelectGroup>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label ?? option.value}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export default function ProviderServicesPage() {
  const { config } = useProviderContext();
  const router = useRouter();
  const [services, setServices] = useState<ProductProps[]>([]);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("all");
  const [status, setStatus] = useState<Status>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<"loading" | "error" | "empty" | "loaded">(
    "loading",
  );
  const debouncedSearch = useDebounce(search);
  const buildQuery = (page: number) => {
    return serviceUrl({
      search: debouncedSearch,
      sort,
      status,
      page,
      limit: 20,
    });
  };

  useEffect(() => {
    const controller = new AbortController();
    const getAll = async () => {
      try {
        setState("loading");
        const res = await fetch(buildQuery(0), {
          signal: controller.signal,
        });
        console.log("Fetch response:", res);
        if (!res.ok) throw new Error();
        const json = await res.json();
        const payload = json.data ?? json;

        const items = payload.data ?? [];
        console.log("Fetched items:", items);
        if (items.length === 0) {
          setState("empty");
          return;
        }

        setServices(items);
        setState("loaded");
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setState("error");
          setError(err.message || "An error occurred while fetching services");
        }
      }
    };

    getAll();
    return () => controller.abort();
  }, [debouncedSearch, sort, status]);

  const deleteService = (id: string) =>
    setServices((prev) => prev.filter((s) => s.id !== id));
  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const toggleStatus = (id: string) => {};
  const clearSelection = () => setSelected(new Set());
  const bulkActivate = () => {};
  const bulkDeactivate = () => {};
  const bulkDelete = () => {};

  const activeFiltersCount = [
    status !== "all",
    sort !== "all",
    search !== "",
  ].filter(Boolean).length;

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
          onClick={() => router.push("/provider/services/new")}
          className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold text-white transition-colors hover:opacity-90 cursor-pointer"
          style={{ background: config.themeColor }}
        >
          <Plus className="w-3.5 h-3.5" /> Add service
        </motion.button>
      </div>

      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 rounded-lg focus:border-emerald-500 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <SortDropdown<Status>
            value={status}
            onChange={setStatus}
            options={STATUS_OPTIONS}
            placeholder="Filter by Status..."
          />

          <SortDropdown<SortKey>
            value={sort}
            onChange={setSort}
            options={SORT_OPTIONS}
          />

          <div className="flex border shrink-0 rounded-lg overflow-hidden w-fit">
            <button
              onClick={() => setView("grid")}
              className={cn("p-2", view === "grid" && "bg-muted")}
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={cn("p-2 border-l", view === "list" && "bg-muted")}
            >
              <List className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Bulk action bar ── */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl border  mb-4"
            style={{
              borderColor: `color-mix(in srgb, ${config.themeColor} 20%, transparent)`,
              backgroundColor: `color-mix(in srgb, ${config.themeColor} 6%, transparent)`,
            }}
          >
            <span className={cn("text-sm font-medium", config.twTextColor)}>
              {selected.size} selected
            </span>
            <div className="flex-1" />
            <button
              onClick={bulkActivate}
              className="text-xs px-3 py-1.5 rounded-lg border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
            >
              Activate
            </button>

            <button
              onClick={bulkDeactivate}
              className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              Deactivate
            </button>

            <button
              onClick={bulkDelete}
              className="text-xs px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
            >
              Delete
            </button>
            <button
              onClick={clearSelection}
              className="text-muted-foreground hover:text-foreground ml-1"
            >
              <X className="size-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-muted-foreground">
          Showing{" "}
          <span className="text-foreground font-medium">{services.length}</span>{" "}
          of {services.length} services
        </span>
        {activeFiltersCount > 0 && (
          <button
            onClick={() => {
              setSearch("");
              setSort("all");
              setStatus("all");
            }}
            className={cn(
              "flex items-center gap-1.5 text-xs transition-colors cursor-pointer",
              config.twTextColor,
            )}
          >
            <SlidersHorizontal className="w-3 h-3" />
            Clear {activeFiltersCount} filter{activeFiltersCount > 1 ? "s" : ""}
          </button>
        )}
      </div>

      {services.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <BookOpen className="size-9 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold font-georgia">
            No services found
          </h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Try adjusting your search or filters
          </p>
        </div>
      ) : view === "grid" ? (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          <AnimatePresence>
            {services.map((s) => (
              <ServiceGridCard
                key={s.id}
                service={s}
                selected={selected.has(s.id)}
                onSelect={() => toggleSelect(s.id)}
                onToggleStatus={() => toggleStatus(s.id)}
                onDelete={() => deleteService(s.id)}
                onEdit={() => router.push(`/provider/services/${s.id}/edit`)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-2">
          <AnimatePresence key="list-view" initial={false}>
            {services.map((s) => (
              <ServiceListRow
                service={s as any}
                selected={selected.has(s.id)}
                onSelect={() => toggleSelect(s.id)}
                onToggleStatus={() => toggleStatus(s.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
