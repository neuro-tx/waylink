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
import { Product } from "../products_moderation/page";
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
  X,
} from "lucide-react";
import { StatusType } from "@/lib/panel-types";
import { cn } from "@/lib/utils";
import ThumbnailImage from "@/components/ThumbnailImage";
import { Badge } from "@/components/ui/badge";
import { fmtCurrency } from "@/lib/helpers";
import Link from "next/link";

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
      "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20",
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
          <Skeleton className="h-4.5 w-32" />
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
      <TableCell colSpan={8} className="h-48 text-center">
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
                Currency
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

                        <div className="flex items-center gap-1 min-w-0">
                          <span className="truncate max-w-40 text-sm font-medium">
                            {product.provider.name}
                          </span>

                          {product.provider.isVerified && (
                            <BadgeCheck className="size-3.5 shrink-0 text-sky-500" />
                          )}
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
                        {fmtCurrency(product.basePrice)}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="text-muted-foreground">
                        {product.currency}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="text-muted-foreground">
                        {new Date(product.createdAt).toLocaleDateString()}
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
                            <Link href={`/admin/products/${product.id}`}>
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
