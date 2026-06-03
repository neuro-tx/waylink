"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  CalendarDays,
  Users,
  Settings,
  CreditCard,
  FileText,
  AlertCircle,
  Car,
  Compass,
  ChevronRight,
  Zap,
  Loader,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDebounce } from "@/hooks/useDebounce";
import { ServiceType } from "@/lib/all-types";
import { Skeleton } from "@/components/ui/skeleton";

type ServiceStatus = "active" | "paused" | "draft" | "archived";
interface Service {
  id: string;
  providerId: string;
  type: ServiceType;
  title: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  basePrice: string;
  currency: string | null;
  status: ServiceStatus;
  createdAt: Date;
  updatedAt: Date;
}

const statusConfig: Record<ServiceStatus, { label: string; color: string }> = {
  active: { label: "Active", color: "#22c55e" },
  paused: { label: "Paused", color: "#f59e0b" },
  draft: { label: "Draft", color: "#94a3b8" },
  archived: { label: "Archived", color: "#ef4444" },
};

const typeIcon = (type: ServiceType) =>
  type === "transport" ? (
    <Car className="h-3.5 w-3.5" />
  ) : (
    <Compass className="h-3.5 w-3.5" />
  );

const quickLinks = [
  {
    label: "My Services",
    icon: <FileText className="h-4 w-4" />,
    path: "/provider/services",
    shortcut: null,
  },
  {
    label: "Bookings",
    icon: <CalendarDays className="h-4 w-4" />,
    path: "/provider/bookings",
    shortcut: null,
  },
  {
    label: "Reviews",
    icon: <Users className="h-4 w-4" />,
    path: "/provider/reviews",
    shortcut: null,
  },
  {
    label: "Profile Settings",
    icon: <Settings className="h-4 w-4" />,
    path: "/account",
    shortcut: "⌘S",
  },
  {
    label: "Subscription",
    icon: <CreditCard className="h-4 w-4" />,
    path: "/provider/subscription",
    shortcut: "⌘P",
  },
];

export function GlobalSearch({ providerId }: { providerId: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setResults([]);
      setError(null);
      setSelected(0);
    }
  }, [open]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const controller = new AbortController();
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = new URL(`${baseUrl}/api/provider/panel/services/search`);
        url.searchParams.set("search", debouncedQuery.trim());
        url.searchParams.set("providerId", providerId);

        const res = await fetch(url.toString(), {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const json = await res.json();
        const data: Service[] = json.data;
        setResults(data);
        setSelected(0);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        setError(err.message ?? "Something went wrong");
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
    return () => controller.abort();
  }, [debouncedQuery, providerId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const total = results.length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => (s + 1) % total);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => (s - 1 + total) % total);
    } else if (e.key === "Enter" && results[selected]) {
      navigateToService(results[selected].id);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const navigateToService = (id: string) => {
    setOpen(false);
    router.push(`/provider/services/${id}/review`);
  };

  const showQuickLinks = !query.trim();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group relative hidden md:inline-flex h-9 w-full items-center justify-start gap-2 rounded-md border border-input bg-muted/50 px-4 py-2 text-sm font-normal text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:pr-12 md:w-56 lg:w-80"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="hidden lg:inline-flex">Search services…</span>
        <span className="inline-flex lg:hidden">Search…</span>
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-6 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <Button
        size="icon"
        onClick={() => setOpen(true)}
        className="md:hidden"
        variant="ghost"
      >
        <Search className="h-4 w-4 shrink-0" />
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="p-0 gap-0 overflow-hidden rounded-xl border border-border w-full">
          <AlertDialogHeader className="sr-only">
            <AlertDialogTitle>Search Services</AlertDialogTitle>
          </AlertDialogHeader>

          <div className="flex items-center gap-3 px-4 border-b h-14">
            {loading ? (
              <Loader className="h-4 w-4 shrink-0 text-muted-foreground animate-spin" />
            ) : (
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search services…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60 text-foreground"
              autoComplete="off"
              spellCheck={false}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors px-1"
              >
                Clear
              </button>
            )}
            <kbd
              onClick={() => setOpen(false)}
              className="cursor-pointer hidden sm:flex h-5 select-none items-center rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
            >
              ESC
            </kbd>
          </div>

          <div className="max-h-105 overflow-y-auto overscroll-contain">
            {error && (
              <div className="flex items-center gap-3 px-4 py-3 m-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!showQuickLinks && !error && (
              <div className="py-3">
                {loading ? (
                  <>
                    <p className="px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Services
                    </p>

                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 px-4 py-2"
                      >
                        <Skeleton className="size-8 rounded-md shrink-0" />

                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-64" />
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Skeleton className="h-5 w-16 rounded-full" />
                          <Skeleton className="h-4 w-14" />
                          <Skeleton className="size-4 rounded" />
                        </div>
                      </div>
                    ))}
                  </>
                ) : results.length > 0 ? (
                  <>
                    <p className="px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Services
                    </p>
                    {results.map((service, i) => {
                      const st = statusConfig[service.status];
                      return (
                        <button
                          key={service.id}
                          onClick={() => navigateToService(service.id)}
                          onMouseEnter={() => setSelected(i)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors group ${
                            selected === i
                              ? "bg-muted/80 text-accent-foreground"
                              : "hover:bg-muted/50"
                          }`}
                        >
                          <span
                            className={`flex items-center justify-center size-8 rounded-md shrink-0 text-muted-foreground border ${
                              selected === i
                                ? "bg-background/60 border-border"
                                : "bg-muted border-transparent"
                            }`}
                          >
                            {typeIcon(service.type)}
                          </span>

                          <span className="flex-1 min-w-0">
                            <span className="block text-sm font-medium truncate leading-tight">
                              {service.title}
                            </span>
                            <span className="block text-xs text-muted-foreground truncate mt-0.5">
                              {service.shortDescription ??
                                service.description ??
                                service.slug}
                            </span>
                          </span>

                          <span className="flex items-center gap-2 shrink-0">
                            <span
                              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                              style={{
                                color: st.color,
                                background: st.color + "20",
                              }}
                            >
                              {st.label}
                            </span>
                            <span className="text-xs font-medium text-muted-foreground tabular-nums">
                              {service.basePrice}
                              {service.currency ? ` ${service.currency}` : ""}
                            </span>
                            <ChevronRight
                              className={`size-3.5 text-muted-foreground/40 transition-transform ${
                                selected === i ? "translate-x-1" : ""
                              }`}
                            />
                          </span>
                        </button>
                      );
                    })}
                  </>
                ) : !loading ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                    <Search className="h-8 w-8 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">
                      No services found for{" "}
                      <span className="font-medium text-foreground">
                        "{query}"
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground/80">
                      Try a different keyword
                    </p>
                  </div>
                ) : null}
              </div>
            )}

            {showQuickLinks && (
              <div className="py-2">
                <p className="px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Quick Links
                </p>
                {quickLinks.map(({ label, icon, path, shortcut }) => (
                  <button
                    key={path}
                    onClick={() => {
                      setOpen(false);
                      router.push(path);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors group"
                  >
                    <span className="flex items-center justify-center size-7 rounded-md bg-muted text-muted-foreground group-hover:bg-background/60 transition-colors border">
                      {icon}
                    </span>
                    <span className="flex-1">{label}</span>
                    {shortcut && (
                      <kbd className="hidden sm:flex h-5 items-center rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground">
                        {shortcut}
                      </kbd>
                    )}
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/80 group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="border-t px-4 py-3 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3" /> Type to search services
            </span>
            <span className="flex items-center gap-1 ml-auto">
              <kbd className="font-mono border shrink-0 rounded px-1 bg-muted">
                ↑↓
              </kbd>{" "}
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="font-mono border shrink-0 rounded px-1 bg-muted">
                ↵
              </kbd>{" "}
              open
            </span>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
