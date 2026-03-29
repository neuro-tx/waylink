"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MapPin,
  Mail,
  Building2,
  Star,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { Pagination, Product, Provider } from "@/lib/all-types";
import { Button } from "../ui/button";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Skeleton } from "../ui/skeleton";

type ProviderStats = {
  activeServices: number;
  avgRating: string;
  totalReviews: number;
};

type Review = {
  id: string;
  authorName: string | null;
  authorImage: string | null;
  rating: number;
  body: string | null;
  createdAt: Date | string;
};

interface Props {
  provider: Provider;
  stats: ProviderStats;
  reviews: Review[];
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function ratingBars(reviews: Review[]) {
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));
  const max = Math.max(...counts.map((c) => c.count), 1);
  return counts.map((c) => ({ ...c, pct: Math.round((c.count / max) * 100) }));
}

function StatusBadge({ status }: { status: string | null }) {
  if (status === "active")
    return (
      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50">
        Active
      </Badge>
    );
  if (status === "pending")
    return (
      <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50">
        Pending
      </Badge>
    );
  return <Badge variant="secondary">{status}</Badge>;
}

export function CoverHeader({ provider }: { provider: Provider }) {
  return (
    <div className="relative">
      <div className="h-64 xl:h-72 w-full rounded-xl overflow-hidden transition">
        <img
          src={provider.cover || "/default.jpg"}
          alt="cover"
          className="object-cover w-full h-full"
        />
      </div>

      <div className="flex items-end gap-4 px-6 relative z-10 -mt-8 xl:-mt-12 transition">
        <div className="size-25 xl:size-32 rounded-full shadow-md border-4 flex items-center justify-center overflow-hidden shrink-0 bg-card">
          {provider.logo ? (
            <img
              src={provider.logo}
              alt={provider.name}
              className="object-cover object-center w-full h-full"
            />
          ) : provider.serviceType === "transport" ? (
            <span className="text-4xl">🚢</span>
          ) : provider.serviceType === "experience" ? (
            <span className="text-4xl">🗺️</span>
          ) : (
            <span className="text-4xl">🏷️</span>
          )}
        </div>

        <div className="flex-1 pb-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-semibold truncate">{provider.name}</h1>
            {provider.isVerified && (
              <CheckCircle2 className="size-4 text-blue-600 shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <StatusBadge status={provider.status} />
            <Badge variant="default" className="text-xs capitalize">
              {provider.serviceType?.replace(/_/g, " ")}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AboutCard({ provider }: { provider: Provider }) {
  if (!provider.description) return null;
  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="text-xs uppercase tracking-widest font-medium text-muted-foreground">
          About
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-base ">{provider.description}</p>
        <div className="flex gap-3 mt-4 flex-col">
          {provider.businessEmail && (
            <span className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Mail className="size-4" /> {provider.businessEmail}
            </span>
          )}
          <span className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Building2 className="size-4" />
            <span className="capitalize">{provider.businessType}</span>
          </span>
          {provider.address && (
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="size-4" /> {provider.address}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-start gap-4 py-3.5">
      <div className="flex-1 space-y-2.5 min-w-0">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-2/5 rounded-full" />
          <Skeleton className="h-4 w-14 rounded-full" />
        </div>
        <Skeleton className="h-2.5 w-4/5 rounded-full" />
        <Skeleton className="h-2.5 w-1/3 rounded-full" />
      </div>
      <Skeleton className="h-5 w-20 rounded-full shrink-0 mt-1" />
    </div>
  );
}

function ServiceRow({
  item,
  index,
  onClick,
}: {
  item: Product;
  index: number;
  onClick: () => void;
}) {
  const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
    experience: {
      label: "Experience",
      color:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    },
    transport: {
      label: "Transport",
      color: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
    },
  };
  const FALLBACK_TYPE = {
    label: "Service",
    color: "bg-muted text-muted-foreground",
  };

  const cfg = TYPE_CONFIG[item.type] ?? FALLBACK_TYPE;
  const price = parseFloat(item.basePrice).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.07, ease: "easeOut" }}
    >
      <button
        onClick={onClick}
        className="w-full text-left group flex items-start gap-4 py-3 px-5 rounded-lg -mx-2 hover:bg-accent/50 active:bg-accent/70 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
      >
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-semibold text-foreground leading-snug group-hover:text-primary transition-colors duration-150 truncate">
              {item.title}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide shrink-0 ${cfg.color}`}
            >
              {cfg.label}
            </span>
          </div>

          {item.shortDescription && (
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 pr-2">
              {item.shortDescription}
            </p>
          )}

          {item.status && (
            <div className="flex items-center gap-1.5 pt-0.5">
              <span
                className={`size-1.5 rounded-full shrink-0 ${
                  item.status === "active"
                    ? "bg-emerald-500"
                    : "bg-muted-foreground/40"
                }`}
              />
              <span className="text-[10px] text-muted-foreground capitalize">
                {item.status}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-sm font-bold text-foreground tabular-nums">
            {item.currency} {price}
          </span>
          <ArrowUpRight className="size-3.5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
        </div>
      </button>
    </motion.div>
  );
}

export function ServicesCard({ providerId }: { providerId: string }) {
  const [items, setItems] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageKey, setPageKey] = useState(0);
  const router = useRouter();

  const fetchProducts = useCallback(
    async (p: number) => {
      setLoading(true);
      try {
        const url = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        const res = await fetch(
          `${url}/api/provider/${providerId}/products?page=${p}`,
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setItems(data.data.items ?? []);
        setPagination(data.data.pagination ?? null);
        setPageKey((k) => k + 1);
      } catch (err) {
        console.error(err);
        setItems([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    },
    [providerId],
  );

  useEffect(() => {
    fetchProducts(page);
  }, [fetchProducts, page]);

  const handlePrev = () => setPage((p) => Math.max(p - 1, 1));
  const handleNext = () =>
    setPage((p) => Math.min(p + 1, pagination?.totalPages ?? p));

  return (
    <Card className="overflow-hidden border border-border/60 shadow-sm bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-[11px] uppercase tracking-widest font-semibold text-muted-foreground">
            Services
          </CardTitle>
          {pagination && pagination.totalPages > 1 && (
            <span className="text-xs text-muted-foreground tabular-nums bg-accent/50 px-3 py-1 rounded-full">
              {pagination.page} / {pagination.totalPages}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-0 divide-y divide-border/50"
            >
              <SkeletonRow />
              <SkeletonRow />
            </motion.div>
          ) : !items.length ? (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="py-8 text-center text-sm text-muted-foreground"
            >
              No services listed yet.
            </motion.p>
          ) : (
            <motion.div
              key={pageKey}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="divide-y divide-border/50"
            >
              {items.map((item, i) => (
                <ServiceRow
                  key={item.id}
                  item={item}
                  index={i}
                  onClick={() => router.push(`/products/${item.id}`)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-3 pt-3.5 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              {pagination.total} total
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 rounded-lg disabled:opacity-30 transition-all duration-150 hover:bg-muted active:scale-97"
                disabled={!pagination.hasPrevPage || loading}
                onClick={handlePrev}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>

              <div className="flex gap-1 px-0.5 items-center">
                {Array.from({ length: pagination.totalPages }).map((_, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => setPage(idx + 1)}
                    disabled={loading}
                    animate={{
                      width: idx + 1 === pagination.page ? 16 : 6,
                      backgroundColor:
                        idx + 1 === pagination.page
                          ? "hsl(var(--foreground))"
                          : "hsl(var(--muted-foreground) / 0.3)",
                    }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className=" rounded-full cursor-pointer"
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 rounded-lg disabled:opacity-30 transition-all duration-150 hover:bg-muted active:scale-97"
                disabled={!pagination.hasNextPage || loading}
                onClick={handleNext}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ReviewsCard({
  reviews,
  stats,
}: {
  reviews: Review[];
  stats: ProviderStats;
}) {
  const bars = ratingBars(reviews);
  return (
    <Card>
      <CardHeader className="pb-3">
        stats
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs uppercase tracking-widest font-medium text-muted-foreground">
            Reviews
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            {stats.totalReviews} total
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-5 pb-4 mb-4 border-b">
          <div>
            <p className="text-4xl font-semibold leading-none">
              {stats?.avgRating}
            </p>
            <div className="flex gap-0.5 mt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`size-3.5 ${
                    s <= Math.round(Number(stats.avgRating))
                      ? "fill-amber-500 text-amber-500"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalReviews} reviews
            </p>
          </div>
          <div className="flex-1 space-y-1">
            {bars.map(({ star, count, pct }) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-3">
                  {star}
                </span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-4 text-right">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No reviews yet.
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.slice(0, 5).map((r) => (
              <div key={r.id} className="space-y-2 ">
                <div className="flex items-center gap-2">
                  <Avatar className="size-7">
                    <AvatarImage src={r.authorImage ?? undefined} />
                    <AvatarFallback className="text-xs">
                      {r?.authorName && initials(r.authorName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium flex-1">
                    {r.authorName}
                  </span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`size-3 ${
                          s <= r.rating
                            ? "fill-amber-500 text-amber-500"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="pl-2 text-muted-foreground">
                  <p className="text-sm leading-relaxed">{r.body}</p>
                  <p className="text-xs">
                    {new Date(r.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function QuickStatsCard({
  stats,
  startedAt,
}: {
  stats: ProviderStats;
  startedAt: Date | string;
}) {
  const rows = [
    { label: "Services offered", value: stats.activeServices },
    {
      label: "Avg rating",
      value: stats.avgRating ? `${stats.avgRating} ★` : "—",
    },
    { label: "Total reviews", value: stats.totalReviews },
    {
      label: "Member since",
      value: startedAt
        ? new Date(startedAt).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })
        : "—",
    },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xs uppercase tracking-widest font-medium text-muted-foreground">
          Quick stats
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-0">
        {rows.map((r, i) => (
          <div
            key={r.label}
            className={`flex justify-between items-center py-2 text-sm gap-3 ${
              i < rows.length - 1 ? "border-b" : ""
            }`}
          >
            <span className="text-muted-foreground">{r.label}</span>
            <span className="font-medium">{r.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function ProviderInfoCard({
  serviceType,
  businessType,
  status,
  verified,
}: {
  serviceType: string;
  businessType: string;
  status: string;
  verified: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xs uppercase tracking-widest font-medium text-muted-foreground">
          Provider info
        </CardTitle>
      </CardHeader>
      <CardContent>
        {[
          {
            label: "Type",
            value: serviceType?.replace(/_/g, " "),
          },
          {
            label: "Business",
            value: businessType,
          },
          {
            label: "Status",
            value: status && <StatusBadge status={status} />,
          },
          {
            label: "Verified",
            value: verified ? (
              <Badge className="bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                ✓ Yes
              </Badge>
            ) : (
              <Badge variant="secondary">No</Badge>
            ),
          },
        ]
          .filter(Boolean)
          .map((row: any, i, arr) => (
            <div
              key={row.label}
              className={`flex justify-between items-center py-2 text-sm gap-2 ${
                i < arr.length - 1 ? "border-b" : ""
              }`}
            >
              <span className="text-muted-foreground">{row.label}</span>
              <span className="font-medium capitalize">{row.value}</span>
            </div>
          ))}
      </CardContent>
    </Card>
  );
}

export function ProviderPublicView({ provider, stats, reviews }: Props) {
  return (
    <main className="pt-28 pb-16 bg-waylink-fade">
      <div className="mian-container space-y-5">
        <CoverHeader provider={provider} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5 items-start">
          <div className="space-y-5">
            <AboutCard provider={provider} />
            <ServicesCard providerId={provider.id} />
            <ReviewsCard reviews={reviews} stats={stats} />
          </div>

          <div className="space-y-4">
            <ProviderInfoCard
              businessType={provider.businessType}
              serviceType={provider.serviceType}
              status={provider?.status}
              verified={provider?.isVerified}
            />
            <QuickStatsCard stats={stats} startedAt={provider.createdAt} />
          </div>
        </div>
      </div>
    </main>
  );
}
