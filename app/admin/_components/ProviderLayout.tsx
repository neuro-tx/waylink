"use client";

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
import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  AlertTriangle,
  BadgeCheck,
  Building2,
  Car,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CircleOff,
  Clock,
  Compass,
  Info,
  Loader2,
  MoreVertical,
  Search,
  ShieldAlert,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";
import {
  BusinessType,
  Pagination,
  Provider,
  ProviderStatus,
  ServiceType,
} from "@/lib/all-types";
import { initials } from "@/lib/helpers";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, fmtDate } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type StatusMeta = {
  label: string;
  icon: React.ReactNode;
  badgeVariant: "default" | "secondary" | "destructive" | "outline";
  className: string;
};

export type ActionMeta = {
  label: string;
  confirmTitle: string;
  confirmDesc: (name: string) => string;
  variant: "destructive" | "default" | "outline";
  icon: React.ReactNode;
  menuClassName?: string;
};
export type ConfirmState = {
  open: boolean;
  provider: Provider | null;
  action: Exclude<ActionType, "view"> | null;
};

const STATUS_META: Record<ProviderStatus, StatusMeta> = {
  pending: {
    label: "Pending",
    icon: <Clock className="h-3 w-3" />,
    badgeVariant: "outline",
    className:
      "border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/10",
  },
  approved: {
    label: "Approved",
    icon: <CheckCircle2 className="h-3 w-3" />,
    badgeVariant: "outline",
    className:
      "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10",
  },
  inactive: {
    label: "Inactive",
    icon: <CircleOff className="h-3 w-3" />,
    badgeVariant: "outline",
    className:
      "border-zinc-500/40 bg-zinc-500/10 text-zinc-400 hover:bg-zinc-500/10",
  },
  suspended: {
    label: "Suspended",
    icon: <ShieldAlert className="h-3 w-3" />,
    badgeVariant: "outline",
    className:
      "border-orange-500/40 bg-orange-500/10 text-orange-400 hover:bg-orange-500/10",
  },
  rejected: {
    label: "Rejected",
    icon: <XCircle className="h-3 w-3" />,
    badgeVariant: "outline",
    className:
      "border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/10",
  },
};

export const ACTION_META: Record<ActionType, ActionMeta> = {
  approve: {
    label: "Approve",
    confirmTitle: "Approve this provider?",
    confirmDesc: (n) =>
      `${n} will be approved and can start receiving bookings. The owner will be notified.`,
    variant: "default",
    icon: <CheckCircle2 className="size-4 text-emerald-500" />,
  },
  suspend: {
    label: "Suspend",
    confirmTitle: "Suspend this provider?",
    confirmDesc: (n) =>
      `${n} will be suspended immediately. No new bookings can be made, but active ones won't be affected.`,
    variant: "destructive",
    icon: <ShieldAlert className="size-4 text-destructive" />,
    menuClassName: "text-destructive focus:text-destructive",
  },
  reject: {
    label: "Reject application",
    confirmTitle: "Reject this application?",
    confirmDesc: (n) =>
      `${n}'s application will be rejected. The owner will be notified and may reapply.`,
    variant: "destructive",
    icon: <XCircle className="size-4 text-rose-500" />,
    menuClassName: "text-destructive focus:text-destructive",
  },
  reactivate: {
    label: "Reactivate",
    confirmTitle: "Reactivate this provider?",
    confirmDesc: (n) =>
      `${n} will be reactivated and become visible to users again.`,
    variant: "default",
    icon: <CheckCircle2 className="size-4 text-fuchsia-500" />,
  },
  verify: {
    label: "Mark as verified",
    confirmTitle: "Mark as verified?",
    confirmDesc: (n) =>
      `${n} will receive a verified badge. Confirm that all documents have been reviewed before proceeding.`,
    variant: "default",
    icon: <ShieldCheck className="size-4 text-sky-500" />,
  },
  view: {
    label: "View details",
    confirmTitle: "",
    confirmDesc: () => "",
    variant: "outline",
    icon: <ChevronRight className="size-4 text-amber-500" />,
  },
};

export const SERVICE_TYPE_ICON: Record<ServiceType, React.ReactNode> = {
  transport: <Car className="h-3.5 w-3.5" />,
  experience: <Compass className="h-3.5 w-3.5" />,
};

const BUSINESS_TYPE_ICON: Record<BusinessType, React.ReactNode> = {
  individual: <User className="h-3 w-3" />,
  company: <Building2 className="h-3 w-3" />,
  agency: <Compass className="h-3 w-3" />,
};

export type ActionType =
  | "approve"
  | "suspend"
  | "reject"
  | "reactivate"
  | "verify"
  | "view";

function getAvailableActions(p: Provider): ActionType[] {
  const actions: ActionType[] = ["view"];
  if (p.status === "pending") actions.push("approve", "reject");
  if (p.status === "approved") actions.push("suspend");
  if (p.status === "suspended" || p.status === "inactive")
    actions.push("reactivate");
  if (!p.isVerified && p.status === "approved") actions.push("verify");
  return actions;
}

export function ProviderAvatar({
  name,
  logo,
  size = "sm",
}: {
  name: string;
  logo: string | null;
  size?: "sm" | "md";
}) {
  const hue = (name.charCodeAt(0) * 37 + (name.charCodeAt(1) ?? 0) * 13) % 360;
  const dim = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";

  if (logo) {
    return (
      <img
        src={logo}
        alt={name}
        className={`${dim} rounded-lg object-cover shrink-0`}
        loading="lazy"
      />
    );
  }
  return (
    <div
      className={`${dim} rounded-lg flex items-center justify-center font-semibold shrink-0 select-none`}
      style={{
        background: `oklch(28% 0.07 ${hue})`,
        color: `oklch(82% 0.14 ${hue})`,
      }}
    >
      {initials(name)}
    </div>
  );
}

export function StatusBadge({ status }: { status: ProviderStatus }) {
  const meta = STATUS_META[status];
  return (
    <Badge
      variant="outline"
      className={`gap-1.5 text-[11px] font-medium ${meta.className}`}
    >
      {meta.icon}
      {meta.label}
    </Badge>
  );
}

export function ConfirmDialog({
  state,
  loading,
  onConfirm,
  onCancel,
}: {
  state: ConfirmState;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!state.provider || !state.action) return null;
  const meta = ACTION_META[state.action];
  const isDestructive = meta.variant === "destructive";

  return (
    <Dialog open={state.open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-md gap-0 p-0 overflow-hidden">
        <div
          className={`h-1 w-full ${
            isDestructive ? "bg-destructive" : "bg-emerald-500"
          }`}
        />

        <div className="p-6 space-y-4">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  isDestructive
                    ? "bg-destructive/10 text-destructive"
                    : "bg-emerald-500/10 text-emerald-500"
                }`}
              >
                {isDestructive ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
              </div>
              <DialogTitle className="text-base">
                {meta.confirmTitle}
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm leading-relaxed">
              {meta.confirmDesc(state.provider.name)}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2.5 rounded-lg border bg-muted/40 px-3 py-2.5">
            <ProviderAvatar
              name={state.provider.name}
              logo={state.provider.logo}
              size="sm"
            />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">
                {state.provider.name}
              </p>
              <p className="text-xs text-muted-foreground">
                /{state.provider.slug}
              </p>
            </div>
            <StatusBadge status={state.provider.status} />
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant={meta.variant}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              {loading ? "Processing…" : meta.label}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function TableRowSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-20 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-3.5 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-3.5 w-32" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-3.5 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-3.5 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-7 w-7 rounded-md" />
      </TableCell>
    </TableRow>
  );
}

export function EmptyState({
  query,
  onClear,
}: {
  query: string;
  onClear: () => void;
}) {
  return (
    <TableRow>
      <TableCell colSpan={8} className="h-48 text-center">
        <div className="flex flex-col items-center gap-3">
          <Search className="h-8 w-8 opacity-50" />
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {query ? `No results for "${query}"` : "No providers found"}
            </p>
            <p className="text-xs text-muted-foreground">
              {query
                ? "Try a different search term or clear filters"
                : "Providers will appear here once registered"}
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

const SERVICE_TYPE_COLORS = {
  transport: "text-blue-600 dark:text-blue-400",
  experience: "text-orange-600 dark:text-orange-400",
} as const;

const BUSINESS_TYPE_COLORS = {
  individual: "text-emerald-600 dark:text-emerald-400",
  company: "text-violet-600 dark:text-violet-400",
  agency: "text-rose-600 dark:text-rose-400",
} as const;

export function ProviderTableRow({
  provider,
  isLoading = false,
  onAction,
}: {
  provider: Provider;
  isLoading?: boolean;
  onAction: (provider: Provider, action: ActionType) => void;
}) {
  const actions = getAvailableActions(provider);
  const nonViewActions = actions.filter((a) => a !== "view");

  return (
    <TableRow className={isLoading ? "pointer-events-none opacity-50" : ""}>
      <TableCell className="px-3">
        <div className="flex items-center gap-2.5">
          <ProviderAvatar name={provider.name} logo={provider.logo} />

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="max-w-32 truncate text-sm font-medium">
                {provider.name}
              </span>

              {provider.isVerified && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <BadgeCheck className="size-3.5 shrink-0 text-blue-400" />
                  </TooltipTrigger>
                  <TooltipContent>Verified</TooltipContent>
                </Tooltip>
              )}

              {isLoading && (
                <Loader2 className="size-3 animate-spin text-muted-foreground" />
              )}
            </div>

            <p className="truncate font-mono text-xs text-muted-foreground">
              /{provider.slug}
            </p>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <StatusBadge status={provider.status} />
      </TableCell>

      <TableCell>
        <div
          className={cn(
            "flex items-center gap-1.5 text-xs capitalize",
            SERVICE_TYPE_COLORS[provider.serviceType],
          )}
        >
          {SERVICE_TYPE_ICON[provider.serviceType]}
          {provider.serviceType}
        </div>
      </TableCell>

      <TableCell>
        <div
          className={cn(
            "mt-0.5 flex items-center gap-1 text-[11px] capitalize",
            BUSINESS_TYPE_COLORS[provider.businessType],
          )}
        >
          {BUSINESS_TYPE_ICON[provider.businessType]}
          {provider.businessType}
        </div>
      </TableCell>

      <TableCell>
        <p className="max-w-40 truncate text-xs">
          {provider.businessEmail ?? (
            <span className="text-muted-foreground/40">—</span>
          )}
        </p>

        {provider.businessPhone && (
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {provider.businessPhone}
          </p>
        )}
      </TableCell>

      <TableCell>
        <p className="max-w-30 truncate text-xs">
          {provider.address ? (
            provider.address
          ) : (
            <span className="text-amber-500">Address unavailable</span>
          )}
        </p>
      </TableCell>

      <TableCell>
        <p className="whitespace-nowrap text-xs text-muted-foreground">
          {fmtDate(provider.createdAt)}
        </p>
      </TableCell>

      <TableCell className="px-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7">
              <MoreVertical className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              onSelect={() => onAction(provider, "view")}
              className="gap-2 text-sm"
            >
              <Info className="size-4 text-amber-500" />
              View details
            </DropdownMenuItem>

            {nonViewActions.length > 0 && <DropdownMenuSeparator />}

            {nonViewActions.map((action) => {
              const meta = ACTION_META[action];

              return (
                <DropdownMenuItem
                  key={action}
                  onSelect={() => onAction(provider, action)}
                  className={`gap-2 text-sm ${meta.menuClassName ?? ""}`}
                >
                  {meta.icon}
                  {meta.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

export function ProviderPagination({
  pagination,
  onPageChange,
  isLoading,
}: {
  pagination: Pagination;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}) {
  const { page, totalPages, total, limit, hasNextPage, hasPrevPage } =
    pagination;

  if (totalPages <= 1) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const pageNumbers = (() => {
    if (totalPages <= 5)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, 4, 5];
    if (page >= totalPages - 2)
      return [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    return [page - 2, page - 1, page, page + 1, page + 2];
  })();

  const showLeadingEllipsis = pageNumbers[0] > 1;
  const showTrailingEllipsis = pageNumbers[pageNumbers.length - 1] < totalPages;

  return (
    <div className="flex items-center justify-between gap-4 p-3">
      <p className="text-xs text-muted-foreground shrink-0">
        <span className="font-medium text-foreground">
          {from}–{to}
        </span>{" "}
        of <span className="font-medium text-foreground">{total}</span>{" "}
        providers
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onPageChange(1)}
          disabled={!hasPrevPage || isLoading}
          aria-label="First page"
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevPage || isLoading}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>

        {showLeadingEllipsis && (
          <>
            <Button
              variant={page === 1 ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7 text-xs"
              onClick={() => onPageChange(1)}
              disabled={isLoading}
            >
              1
            </Button>
            <span className="text-muted-foreground text-xs px-0.5">…</span>
          </>
        )}

        {pageNumbers.map((p) => (
          <Button
            key={p}
            variant={p === page ? "secondary" : "ghost"}
            size="icon"
            className="h-7 w-7 text-xs"
            onClick={() => onPageChange(p)}
            disabled={isLoading}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </Button>
        ))}

        {showTrailingEllipsis && (
          <>
            <span className="text-muted-foreground text-xs px-0.5">…</span>
            <Button
              variant={page === totalPages ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7 text-xs"
              onClick={() => onPageChange(totalPages)}
              disabled={isLoading}
            >
              {totalPages}
            </Button>
          </>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage || isLoading}
          aria-label="Next page"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onPageChange(totalPages)}
          disabled={!hasNextPage || isLoading}
          aria-label="Last page"
        >
          <ChevronsRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
