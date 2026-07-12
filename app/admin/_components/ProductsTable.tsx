"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Archive,
  BadgeCheck,
  BarChart2,
  Car,
  Compass,
  FileText,
  Loader2,
  MoreVertical,
  Pause,
  Play,
  Search,
  Star,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { StatusType } from "@/lib/panel-types";
import { cn, timeAgo } from "@/lib/utils";
import ThumbnailImage from "@/components/ThumbnailImage";
import { Badge } from "@/components/ui/badge";
import { fmtCurrency } from "@/lib/helpers";
import Link from "next/link";
import { Pagination } from "@/lib/all-types";
import { AdminProductsTableData as Product } from "@/lib/admin-types";
import { useMemo } from "react";

type ProductsTableProps = {
  products: Product[];
  isLoading: boolean;
  loadingId?: string | null;
  search: string;
  onClearSearch: () => void;
  onTransition: (product: Product, transition: Transition) => void;
};

type Transition = {
  to: StatusType;
  label: string;
  icon: React.ReactNode;
  destructive?: boolean;
};
type StatusMeta = { label: string; icon: React.ReactNode; badge: string };

interface DataPaginationProps {
  pagination: Pagination;
  onPageChange: (page: number) => void;
  className?: string;
  isLoading?: boolean;
}

const TRANSITIONS: Record<StatusType, Transition[]> = {
  active: [
    {
      to: "paused",
      label: "Pause",
      icon: <Pause className="size-4 text-amber-500" />,
    },
    {
      to: "archived",
      label: "Archive",
      icon: <Archive className="size-4 text-destructive" />,
      destructive: true,
    },
  ],
  paused: [
    {
      to: "active",
      label: "Activate",
      icon: <Play className="size-4 text-emerald-500" />,
    },
    {
      to: "archived",
      label: "Archive",
      icon: <Archive className="size-4 text-destructive" />,
      destructive: true,
    },
  ],
  draft: [
    {
      to: "active",
      label: "Publish",
      icon: <Play className="size-4 text-emerald-500" />,
    },
    {
      to: "archived",
      label: "Archive",
      icon: <Archive className="size-4 text-destructive" />,
      destructive: true,
    },
  ],
  archived: [],
};

const SERVICE_TYPE_CONFIG = {
  transport: {
    label: "Transport",
    icon: Car,
    className:
      "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20",
  },
  experience: {
    label: "Experience",
    icon: Compass,
    className:
      "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20",
  },
} as const;

export const STATUS_META: Record<StatusType, StatusMeta> = {
  active: {
    label: "Active",
    icon: <Play className="h-3 w-3" />,
    badge:
      "border-emerald-500/30 bg-emerald-500/8 text-emerald-400 hover:bg-emerald-500/8",
  },
  paused: {
    label: "Paused",
    icon: <Pause className="h-3 w-3" />,
    badge:
      "border-amber-500/30  bg-amber-500/8  text-amber-400  hover:bg-amber-500/8",
  },
  draft: {
    label: "Draft",
    icon: <FileText className="h-3 w-3" />,
    badge:
      "border-blue-500/30   bg-blue-500/8   text-blue-400   hover:bg-blue-500/8",
  },
  archived: {
    label: "Archived",
    icon: <Archive className="h-3 w-3" />,
    badge:
      "border-zinc-500/30   bg-zinc-500/8   text-zinc-400   hover:bg-zinc-500/8",
  },
};

export function Stars({ rating, count }: { rating: number; count: number }) {
  if (!count)
    return <span className="text-xs text-muted-foreground/40">No reviews</span>;
  return (
    <div className="flex items-center gap-1">
      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
      <span className="text-xs font-medium tabular-nums">
        {rating.toFixed(1)}
      </span>
      <span className="text-[11px] text-muted-foreground">({count})</span>
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-16 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-12" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-7 w-7 rounded-md" />
      </TableCell>
    </TableRow>
  );
}

export function ProductStatusBadge({ status }: { status: StatusType }) {
  const m = STATUS_META[status];
  return (
    <Badge
      variant="outline"
      className={`gap-1.5 text-[11px] font-medium ${m.badge}`}
    >
      {m.icon}
      {m.label}
    </Badge>
  );
}

function EmptyState({
  query,
  onClear,
}: {
  query: string;
  onClear: () => void;
}) {
  return (
    <TableRow>
      <TableCell colSpan={10} className="h-48 text-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Search className="h-8 w-8 opacity-20" />
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {query ? `No results for "${query}"` : "No products found"}
            </p>
            <p className="text-xs opacity-60">
              {query
                ? "Try a different search or clear filters"
                : "Products will appear here once created"}
            </p>
          </div>
          {query && (
            <Button variant="ghost" size="sm" onClick={onClear}>
              Clear search
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

export function ProductsTable({
  products,
  isLoading,
  loadingId,
  search,
  onClearSearch,
  onTransition,
}: ProductsTableProps) {
  return (
    <div className="rounded-md border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-[11px] uppercase tracking-wider font-medium">
                Service
              </TableHead>

              <TableHead className="text-[11px] uppercase tracking-wider font-medium">
                Provider
              </TableHead>

              <TableHead className="text-[11px] uppercase tracking-wider font-medium">
                Type
              </TableHead>

              <TableHead className="text-[11px] uppercase tracking-wider font-medium">
                Status
              </TableHead>

              <TableHead className="text-[11px] uppercase tracking-wider font-medium">
                Price
              </TableHead>

              <TableHead className="text-[11px] uppercase tracking-wider font-medium">
                Rating
              </TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider font-medium">
                Bookings
              </TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider font-medium">
                Revenue
              </TableHead>

              <TableHead className="text-[11px] uppercase tracking-wider font-medium">
                Created
              </TableHead>

              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRowSkeleton key={i} />
              ))
            ) : products.length === 0 ? (
              <EmptyState query={search} onClear={onClearSearch} />
            ) : (
              products.map((product) => {
                const transitions = TRANSITIONS[product.status] ?? [];
                const rowLoading = loadingId === product.id;

                const service = SERVICE_TYPE_CONFIG[product.serviceType];
                const ServiceIcon = service.icon;
                const provider = product.provider;

                return (
                  <TableRow
                    key={product.id}
                    className={cn(
                      "relative transition-all duration-300",
                      rowLoading &&
                        "pointer-events-none opacity-60 scale-[0.995] animate-pulse",
                    )}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <ThumbnailImage alternative={product.title} />

                        <div className="min-w-0">
                          <p className="truncate max-w-48 text-sm font-medium">
                            {product.title}
                          </p>

                          <p className="truncate text-xs text-muted-foreground">
                            {product.slug}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <ThumbnailImage
                          src={product.provider.logo}
                          alternative={product.provider.name}
                          className="rounded-full"
                        />

                        <div>
                          <div className="flex items-center gap-1 min-w-0">
                            <span className="truncate max-w-40 text-sm font-medium">
                              {provider.name}
                            </span>

                            {provider.isVerified && (
                              <BadgeCheck className="size-3.5 shrink-0 text-sky-500" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {provider.slug}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "gap-1.5 rounded-full",
                          service.className,
                        )}
                      >
                        <ServiceIcon className="size-3.5" />
                        {service.label}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <ProductStatusBadge status={product.status} />
                    </TableCell>

                    <TableCell>
                      <span className="font-medium tabular-nums text-green-600 dark:text-green-400">
                        {fmtCurrency(product.basePrice)} -{" "}
                        <span className="text-rose-500">
                          {product.currency}
                        </span>
                      </span>
                    </TableCell>

                    <TableCell>
                      <Stars
                        rating={Number(product.avgRate) ?? 0}
                        count={product.reviews}
                      />
                    </TableCell>

                    <TableCell>
                      <span className="text-xs tabular-nums font-medium">
                        {product.bookings}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs tabular-nums font-medium text-emerald-500">
                        {fmtCurrency(
                          Number(product.totalRevenue),
                          product.currency,
                        )}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="text-muted-foreground">
                        {timeAgo(product.createdAt)}
                      </span>
                    </TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            disabled={rowLoading}
                          >
                            {rowLoading ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <MoreVertical className="size-3.5" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem className="gap-2 text-xs" asChild>
                            <Link
                              href={`/admin/products_moderation/${product.id}`}
                            >
                              <BarChart2 className="size-3.5" />
                              View details
                            </Link>
                          </DropdownMenuItem>

                          {transitions.length > 0 && <DropdownMenuSeparator />}

                          {transitions.map((transition) => (
                            <DropdownMenuItem
                              key={transition.to}
                              className={cn(
                                "gap-2 text-xs",
                                transition.destructive &&
                                  "text-destructive focus:text-destructive",
                              )}
                              onSelect={() => onTransition(product, transition)}
                            >
                              {transition.icon}
                              {transition.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function DataPagination({
  pagination,
  onPageChange,
  className,
  isLoading = false,
}: DataPaginationProps) {
  const { page, totalPages, total, hasNextPage, hasPrevPage } = pagination;

  const pages = useMemo(
    () => getVisiblePages(page, totalPages),
    [page, totalPages],
  );

  const goTo = (target: number) => {
    if (isLoading || target === page || target < 1 || target > totalPages) {
      return;
    }
    onPageChange(target);
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-t pt-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        {total.toLocaleString()} result{total !== 1 && "s"}
        {isLoading && <Loader2 className="size-3.5 animate-spin" />}
      </p>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <Button
            size="icon-sm"
            variant="outline"
            aria-label="First page"
            disabled={!hasPrevPage || isLoading}
            onClick={() => goTo(1)}
          >
            <ChevronsLeft className="size-4" />
          </Button>

          <Button
            size="icon-sm"
            variant="outline"
            aria-label="Previous page"
            disabled={!hasPrevPage || isLoading}
            onClick={() => goTo(page - 1)}
          >
            <ChevronLeft className="size-4" />
          </Button>

          {pages.map((item, index) =>
            item === "..." ? (
              <span
                key={`ellipsis-${index}`}
                className="flex size-8 items-center justify-center text-sm text-muted-foreground"
              >
                …
              </span>
            ) : (
              <Button
                key={item}
                size="icon-sm"
                variant={item === page ? "default" : "outline"}
                aria-label={`Page ${item}`}
                aria-current={item === page ? "page" : undefined}
                disabled={isLoading}
                onClick={() => goTo(item)}
              >
                {item}
              </Button>
            ),
          )}

          <Button
            size="icon-sm"
            variant="outline"
            aria-label="Next page"
            disabled={!hasNextPage || isLoading}
            onClick={() => goTo(page + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>

          <Button
            size="icon-sm"
            variant="outline"
            aria-label="Last page"
            disabled={!hasNextPage || isLoading}
            onClick={() => goTo(totalPages)}
          >
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

function getVisiblePages(current: number, total: number): (number | "...")[] {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, "...", total];
  }

  if (current >= total - 3) {
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  }

  return [1, "...", current - 1, current, current + 1, "...", total];
}
