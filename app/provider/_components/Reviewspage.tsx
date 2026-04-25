"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import {
  Star,
  MessageSquareReply,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  PackageSearch,
  ArrowRight,
} from "lucide-react";
import { cn, fmtDate } from "@/lib/utils";
import type { ProductReview, ProviderStats, Pagination } from "@/lib/all-types";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useReview } from "@/hooks/useReview";
import { toast } from "sonner";

export type ReviewsApiResponse = {
  reviews: ProductReview[];
  stats: ProviderStats;
  pagination: Pagination;
  product?: { id: string; title: string };
};

export type SortOption = "newest" | "oldest" | "highest" | "lowest";

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={
            s <= rating
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted-foreground/30"
          }
        />
      ))}
    </span>
  );
}

function RatingBar({
  label,
  count,
  total,
}: {
  label: string;
  count: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-sm shrink-0">
      <span className="w-8 shrink-0 text-right text-muted-foreground text-xs">
        {label}
      </span>
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-7 shrink-0 text-xs text-muted-foreground">
        {count}
      </span>
    </div>
  );
}

function StatsSection({ stats }: { stats: ProviderStats }) {
  const rows: [string, number][] = [
    ["5★", stats.fiveStar],
    ["4★", stats.fourStar],
    ["3★", stats.threeStar],
    ["2★", stats.twoStar],
    ["1★", stats.oneStar],
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-4 p-4 rounded-xl border bg-card">
      <div className="flex flex-col items-center justify-center gap-1 sm:pr-6 sm:border-r border-border min-w-25">
        <p className="text-5xl font-semibold tracking-tight text-foreground">
          {stats.avgRating}
        </p>
        <StarRow rating={Math.round(Number(stats.avgRating))} size={16} />
        <p className="text-xs text-muted-foreground mt-0.5">
          {stats.totalReviews.toLocaleString()} reviews
        </p>
      </div>

      <div className="flex flex-col justify-center gap-1.5 flex-1">
        {rows.map(([label, count]) => (
          <RatingBar
            key={label}
            label={label}
            count={count}
            total={stats.totalReviews}
          />
        ))}
      </div>

      <div className="sm:col-span-2 grid grid-cols-3 gap-3 pt-3 border-t border-border">
        {[
          { label: "Total reviews", value: stats.totalReviews },
          { label: "Avg rating", value: stats.avgRating },
          { label: "Services", value: stats.totalServices },
        ].map((s) => (
          <div key={s.label} className="rounded-lg bg-muted/50 px-3 py-2">
            <p className="text-xs text-muted-foreground tracking-wider">
              {s.label}
            </p>
            <p className="text-lg mt-2 font-medium text-foreground">
              {s.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReplyForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
  error
}: {
  initial?: string;
  onSubmit: (text: string) => void;
  onCancel: () => void;
  submitLabel: string;
  error: boolean
}) {
  const [value, setValue] = useState(initial ?? "");
  const [pending, startT] = useTransition();

  function handle() {
    if (!value.trim()) return;
    startT(() => onSubmit(value.trim()));
  }

  return (
    <div className="mt-3 space-y-2">
      <Textarea
        className={cn("min-h-22 text-sm resize-none" ,error && "border-destructive")}
        placeholder="Write your response to this review…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" onClick={handle} disabled={pending || !value.trim()}>
          {pending ? "Saving…" : submitLabel}
        </Button>
      </div>
    </div>
  );
}

function ReviewCard({
  review,
  onReplySubmit,
  onReplyEdit,
  onReplyDelete,
  errMes,
}: {
  review: ProductReview;
  onReplySubmit: (id: string, text: string) => Promise<void>;
  onReplyEdit: (id: string, text: string) => Promise<void>;
  onReplyDelete: (id: string) => Promise<void>;
  errMes: string|null;
}) {
  const [mode, setMode] = useState<"idle" | "replying" | "editing">("idle");
  const hasResponse = !!review.providerResponse;
  const hasError = !!errMes;

  const initials = review.user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card
      className={cn(
        "transition-all duration-200 gap-5",
        hasResponse && "border-l-2 border-l-emerald-500",
        hasError &&
          "border-destructive ring-1 ring-destructive/40 animate-shake",
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarImage src={review.user.image ?? undefined} />
              <AvatarFallback className="text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium leading-none">
                {review.user.name}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {review.user.email}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StarRow rating={review.rating} />
            <span className="text-xs text-muted-foreground">
              {fmtDate(review.createdAt)}
            </span>
            {review.isVerified && (
              <Badge
                variant="outline"
                className="gap-1 text-xs text-emerald-600 border-emerald-300 dark:border-emerald-700 dark:text-emerald-400"
              >
                <ShieldCheck size={11} />
                Verified
              </Badge>
            )}
            <Tooltip>
              <TooltipTrigger
                asChild
                className="text-muted-foreground hover:text-foreground transition"
              >
                <Link href={`/provider/service/${review.productId}`}>
                  <ArrowRight size={15} />
                </Link>
              </TooltipTrigger>
              <TooltipContent>View product</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {hasError && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errMes}
          </div>
        )}
        {review.comment ? (
          <p className="text-sm text-foreground leading-relaxed">
            {review.comment}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            No comment left.
          </p>
        )}

        {hasResponse && mode !== "editing" && (
          <div className="rounded-lg bg-muted/60 border border-border px-3 py-2.5 space-y-1.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <MessageSquareReply size={12} />
                Your response
              </span>
              <div className="flex gap-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setMode("editing")}
                >
                  <Pencil size={12} />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                    >
                      <Trash2 size={12} />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete response?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently remove your response to this
                        review.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => onReplyDelete(review.id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {review.providerResponse}
            </p>
            {review.respondedAt && (
              <p className="text-xs text-muted-foreground/60">
                Responded {fmtDate(review.respondedAt)}
              </p>
            )}
          </div>
        )}

        {mode === "editing" && (
          <ReplyForm
            initial={review.providerResponse ?? ""}
            onSubmit={async (text) => {
              await onReplyEdit(review.id, text);
              setMode("idle");
            }}
            onCancel={() => setMode("idle")}
            submitLabel="Save changes"
            error={hasError}
          />
        )}

        {!hasResponse && mode === "idle" && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs h-7"
            onClick={() => setMode("replying")}
          >
            <MessageSquareReply size={13} />
            Reply to review
          </Button>
        )}

        {!hasResponse && mode === "replying" && (
          <ReplyForm
            onSubmit={async (text) => {
              await onReplySubmit(review.id, text);
              setMode("idle");
            }}
            onCancel={() => setMode("idle")}
            submitLabel="Post response"
            error={hasError}
          />
        )}
      </CardContent>
    </Card>
  );
}

function ReviewSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </CardContent>
    </Card>
  );
}

export default function ReviewsPage({ providerId }: { providerId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const productFromUrl = searchParams.get("product") ?? "all";
  const sortFromUrl = (searchParams.get("sort") ?? "newest") as SortOption;
  const ratingFromUrl = searchParams.get("rating") ?? "all";
  const pageFromUrl = Number(searchParams.get("page") ?? "1");

  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [stats, setStats] = useState<ProviderStats | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<{ id: string; title: string } | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();
  const { update, error: reviewError } = useReview();

  const safePush = useCallback(
    (patch: Record<string, string | null>) => {
      const p = new URLSearchParams(searchParams.toString());

      let changed = false;

      Object.entries(patch).forEach(([k, v]) => {
        const current = p.get(k) ?? "all";

        if (v === current) return;

        changed = true;

        if (v === null || v === "all" || v === "newest" || v === "1") {
          p.delete(k);
        } else {
          p.set(k, v);
        }
      });

      if (!changed) return;

      router.push(`${pathname}?${p.toString()}`, { scroll: false });
    },
    [searchParams, pathname, router],
  );

  const setTab = useCallback(
    (v: string) => {
      safePush({
        product: v,
        page: "1",
        rating: null,
        sort: null,
      });
    },
    [safePush],
  );

  const setSort = useCallback(
    (v: string) => {
      safePush({ sort: v, page: "1" });
    },
    [safePush],
  );

  const setRating = useCallback(
    (v: string) => {
      safePush({ rating: v, page: "1" });
    },
    [safePush],
  );

  const setPage = useCallback(
    (v: number) => {
      if (v === pageFromUrl) return;

      startTransition(() => {
        safePush({ page: String(v) });
      });
    },
    [safePush, pageFromUrl],
  );

  const mainUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const p = new URLSearchParams();
      p.set("provider", providerId);
      if (productFromUrl !== "all") p.set("product", productFromUrl);
      if (ratingFromUrl !== "all") p.set("rating", ratingFromUrl);
      p.set("sort", sortFromUrl);
      p.set("page", String(pageFromUrl));
      p.set("limit", "5");

      const res = await fetch(
        `${mainUrl}/api/provider/panel/reviews?${p.toString()}`,
      );
      if (!res.ok) throw new Error("Failed to load reviews");
      const json = await res.json();
      const data: ReviewsApiResponse = json.data;

      setReviews(data.reviews);
      setStats(data.stats);
      setProduct(data?.product ?? null);
      setPagination(data.pagination);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [providerId, productFromUrl, ratingFromUrl, sortFromUrl, pageFromUrl]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  async function handleReply(reviewId: string, text: string) {
    const updated = await update(reviewId, {
      providerResponse: text,
    });

    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, ...updated } : r)),
    );
  }

  async function handleReplyDelete(reviewId: string) {
        const updated = await update(reviewId, {
          providerResponse: null,
        });

        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, ...updated } : r)),
        );
  }

  return (
    <div className="space-y-6 w-full px-4 md:px-6 overflow-x-hidden py-6">
      <div>
        {loading ? (
          <div className="space-y-1">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-72" />
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-semibold tracking-tight">Reviews</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {product
                ? `Viewing reviews for "${product.title}"`
                : "Manage and respond to all customer reviews"}
            </p>
          </>
        )}
      </div>

      {stats ? (
        <StatsSection stats={stats} />
      ) : (
        <Skeleton className="h-48 w-full rounded-xl" />
      )}

      <Separator />

      <div className="flex flex-col gap-3">
        {product && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab("all")}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs border transition",
                productFromUrl === "all"
                  ? "bg-foreground text-background border-foreground font-medium"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              All reviews
            </button>

            <button
              onClick={() => setTab(product.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs border transition max-w-50 truncate",
                productFromUrl === product.id
                  ? "bg-foreground text-background border-foreground font-medium"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {product.title}
            </button>
          </div>
        )}

        <div className="flex flex-nowrap items-center justify-between gap-2">
          <div className="flex flex-nowrap items-center justify-between gap-2">
            {loading ? (
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-7 w-12" />
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {["all", "5", "4", "3", "2", "1"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRating(r)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs border transition-all",
                      ratingFromUrl === r
                        ? "bg-foreground text-background border-foreground font-medium"
                        : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground cursor-pointer",
                    )}
                  >
                    {r === "all" ? "All" : `${r}★`}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <Select
              value={sortFromUrl}
              onValueChange={setSort}
              disabled={loading}
            >
              <SelectTrigger className="h-8 text-xs max-w-36">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="highest">Highest rating</SelectItem>
                <SelectItem value="lowest">Lowest rating</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <ReviewSkeleton key={i} />)
        ) : error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={fetchReviews}
            >
              Retry
            </Button>
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
            <PackageSearch size={36} className="opacity-30" />
            <p className="text-sm">
              {product
                ? `No reviews found for "${product.title}".`
                : "No reviews match the current filters."}
            </p>
          </div>
        ) : (
          reviews.map((rv) => (
            <ReviewCard
              key={rv.id}
              review={rv}
              onReplySubmit={handleReply}
              onReplyEdit={handleReply}
              onReplyDelete={handleReplyDelete}
              errMes={"reviewError"}
            />
          ))
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1}–
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total}
          </p>
          <div className="flex gap-2">
            {pagination.hasPrevPage && (
              <Button
                variant="outline"
                className="text-xs cursor-pointer"
                onClick={() => setPage(pageFromUrl - 1)}
                disabled={isPending || loading}
              >
                <ChevronUp size={13} />
                Load less
              </Button>
            )}
            {pagination.hasNextPage && (
              <Button
                className="text-xs cursor-pointer"
                onClick={() => setPage(pageFromUrl + 1)}
                disabled={isPending || loading}
              >
                Load more
                <ChevronDown size={13} />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
