"use client";

import {
  useState,
  useMemo,
  useCallback,
  useTransition,
  useEffect,
} from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  AlertCircle,
  AlertTriangle,
  Archive,
  BadgeCheck,
  BarChart2,
  Car,
  CheckCircle2,
  Compass,
  FileText,
  Loader2,
  MoreVertical,
  Pause,
  Play,
  Search,
  X,
} from "lucide-react";
import Image from "next/image";
import { Provider, ServiceType } from "@/lib/all-types";
import { StatusType } from "@/lib/panel-types";
import { cn } from "@/lib/utils";
import { fmtCurrency } from "@/lib/helpers";

type Product = {
  id: string;
  title: string;
  slug: string;
  providerId: string;
  shortDescription: string;
  serviceType: ServiceType;
  status: StatusType;
  currency: string;
  basePrice: number;
  provider: Pick<Provider, "id" | "name" | "logo" | "isVerified">;
  createdAt: Date | string;
  updatedAt: Date | string;
};

type StatusMeta = { label: string; icon: React.ReactNode; badge: string };

const STATUS_META: Record<StatusType, StatusMeta> = {
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

type Transition = {
  to: StatusType;
  label: string;
  icon: React.ReactNode;
  destructive?: boolean;
};

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

const STATUS_TABS: { key: StatusType | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "paused", label: "Paused" },
  { key: "draft", label: "Draft" },
  { key: "archived", label: "Archived" },
];

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

function ThumbnailImage({
  alternative,
  src,
  className,
}: {
  alternative: string;
  src: string | null;
  className?: string;
}) {
  const hue =
    (alternative.charCodeAt(0) * 41 + (alternative.charCodeAt(1) ?? 0) * 17) %
    360;
  if (src)
    return (
      <Image
        src={src}
        alt={alternative}
        className={cn("h-9 w-9 rounded-lg object-cover shrink-0", className)}
        width={40}
        height={40}
      />
    );

  return (
    <div
      className={cn(
        "h-9 w-9 rounded-lg flex items-center justify-center text-xs font-semibold shrink-0 select-none",
        className,
      )}
      style={{
        background: `oklch(28% 0.07 ${hue})`,
        color: `oklch(82% 0.14 ${hue})`,
      }}
    >
      {alternative.slice(0, 2).toUpperCase()}
    </div>
  );
}

function StatusBadge({ status }: { status: StatusType }) {
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

type ConfirmPayload = { product: Product; transition: Transition };

function ConfirmDialog({
  payload,
  loading,
  onConfirm,
  onCancel,
}: {
  payload: ConfirmPayload | null;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!payload) return null;
  const { product, transition } = payload;

  return (
    <Dialog open onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-sm gap-0 p-0 overflow-hidden">
        <div
          className={`h-0.5 w-full ${transition.destructive ? "bg-destructive" : "bg-emerald-500"}`}
        />
        <div className="p-6 space-y-4">
          <DialogHeader className="space-y-2">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${transition.destructive ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-500"}`}
            >
              {transition.destructive ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
            </div>
            <DialogTitle className="text-base">
              {transition.label} this product?
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              {transition.to === "archived"
                ? `"${product.title}" will be archived and hidden from all users. You can restore it to draft later.`
                : `"${product.title}" will be set to ${STATUS_META[transition.to].label.toLowerCase()}.`}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2.5 rounded-lg border bg-muted/40 px-3 py-2.5">
            <ThumbnailImage alternative={product.title} src={null} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">{product.title}</p>
              <p className="text-xs text-muted-foreground">
                {product.provider.name}
              </p>
            </div>
            <StatusBadge status={product.status} />
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant={transition.destructive ? "destructive" : "default"}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              {loading ? "Updating…" : transition.label}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
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

export default function ProductsModerationPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<StatusType | "all">("all");
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState<ServiceType | "all">(
    "all",
  );

  const [isLoading] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmPayload | null>(null);
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return products.filter((p) => {
      if (activeTab !== "all" && p.status !== activeTab) return false;
      if (serviceFilter !== "all" && p.serviceType !== serviceFilter)
        return false;
      if (q)
        return (
          p.title.toLowerCase().includes(q) ||
          p.provider.name.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q)
        );
      return true;
    });
  }, [products, activeTab, serviceFilter, search]);

  const applyTransition = useCallback(
    (productId: string, newStatus: StatusType) => {
      startTransition(() => {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId
              ? { ...p, status: newStatus, updatedAt: new Date() }
              : p,
          ),
        );
      });
    },
    [],
  );

  const handleTransition = useCallback(
    (product: Product, transition: Transition) => {
      if (transition.destructive) {
        setConfirm({ product, transition });
      } else {
        setLoadingId(product.id);
        setTimeout(() => {
          // replace with: await updateProductStatus(product.id, transition.to)
          applyTransition(product.id, transition.to);
          setLoadingId(null);
        }, 1000);
      }
    },
    [applyTransition],
  );

  const handleConfirm = useCallback(async () => {
    if (!confirm) return;
    setLoadingId(confirm.product.id);
    setError(null);
    try {
      await new Promise<void>((res, rej) =>
        setTimeout(() => (Math.random() > 0.1 ? res() : rej()), 900),
      );
      applyTransition(confirm.product.id, confirm.transition.to);
      setConfirm(null);
    } catch {
      setError(
        `Failed to ${confirm.transition.label.toLowerCase()} "${confirm.product.title}".`,
      );
      setConfirm(null);
    } finally {
      setLoadingId(null);
    }
  }, [confirm, applyTransition]);

  return (
    <TooltipProvider>
      <div className="space-y-6 px-4 md:px-6 py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Product moderation
            </h1>
            <p className="text-sm text-muted-foreground">
              Review, moderate, and track performance across all provider
              listings
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-lg border bg-muted/40 p-1 shrink-0">
            {(["all", "transport", "experience"] as const).map((s) => (
              <Button
                key={s}
                variant={serviceFilter === s ? "secondary" : "ghost"}
                size="sm"
                className="h-7 text-xs gap-1.5"
                onClick={() => setServiceFilter(s)}
              >
                {s === "transport" && <Car className="h-3 w-3" />}
                {s === "experience" && <Compass className="h-3 w-3" />}
                <span className="capitalize">
                  {s === "all" ? "All types" : s}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="py-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between gap-4">
              {error}
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 shrink-0 text-destructive"
                onClick={() => setError(null)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as StatusType | "all")}
          >
            <TabsList className="h-auto p-1 flex-wrap gap-0.5">
              {STATUS_TABS.map(({ key, label }) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="text-sm h-7 cursor-pointer"
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="relative sm:ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search products or providers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full sm:w-80 text-sm"
            />
            {search && (
              <button
                className="absolute bg-transparent grid place-items-center right-1.5 top-1/2 -translate-y-1/2 size-5"
                onClick={() => setSearch("")}
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

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
                ) : filtered.length === 0 ? (
                  <EmptyState query={search} onClear={() => setSearch("")} />
                ) : (
                  filtered.map((product) => {
                    const transitions = TRANSITIONS[product.status] ?? [];
                    const rowLoading = loadingId === product.id;

                    return (
                      <TableRow
                        key={product.id}
                        className={cn(
                          rowLoading && "opacity-50 pointer-events-none",
                        )}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <ThumbnailImage
                              alternative={product.title}
                              src={null}
                            />

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="truncate max-w-48 text-sm font-medium">
                                  {product.title}
                                </span>

                                {rowLoading && (
                                  <Loader2 className="h-3 w-3 animate-spin text-muted-foreground shrink-0" />
                                )}
                              </div>

                              <p className="text-xs text-muted-foreground truncate">
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

                            <div className="min-w-0">
                              <div className="flex items-center gap-1">
                                <span className="truncate max-w-40 text-sm font-medium">
                                  {product.provider.name}
                                </span>

                                {product.provider.isVerified && (
                                  <BadgeCheck className="size-3.5 text-sky-500 shrink-0" />
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          {(() => {
                            const config =
                              SERVICE_TYPE_CONFIG[product.serviceType];
                            const Icon = config.icon;

                            return (
                              <Badge
                                variant="outline"
                                className={cn(
                                  "gap-1.5 rounded-full px-2.5 py-0.5 font-medium",
                                  config.className,
                                )}
                              >
                                <Icon className="size-3.5" />
                                {config.label}
                              </Badge>
                            );
                          })()}
                        </TableCell>

                        <TableCell>
                          <StatusBadge status={product.status} />
                        </TableCell>

                        <TableCell>
                          <span className="text-sm tabular-nums text-green-600 dark:text-green-400 font-medium">
                            {fmtCurrency(product.basePrice)}
                          </span>
                        </TableCell>

                        <TableCell>
                          <span className="text-sm text-muted-foreground font-medium">
                            {product.currency}
                          </span>
                        </TableCell>

                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {new Date(product.createdAt).toLocaleDateString()}
                          </span>
                        </TableCell>

                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                              >
                                <MoreVertical className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem className="text-xs gap-2">
                                <BarChart2 className="h-3.5 w-3.5" />
                                View details
                              </DropdownMenuItem>

                              {transitions.length > 0 && (
                                <DropdownMenuSeparator />
                              )}

                              {transitions.map((t) => (
                                <DropdownMenuItem
                                  key={t.to}
                                  onSelect={() => handleTransition(product, t)}
                                  className={`text-xs gap-2 ${
                                    t.destructive
                                      ? "text-destructive focus:text-destructive"
                                      : ""
                                  }`}
                                >
                                  {t.icon}
                                  {t.label}
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
      </div>

      <ConfirmDialog
        payload={confirm}
        loading={!!loadingId && confirm?.product.id === loadingId}
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
      />
    </TooltipProvider>
  );
}
