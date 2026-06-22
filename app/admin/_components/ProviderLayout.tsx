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
  CheckCircle2,
  ChevronRight,
  CircleOff,
  Clock,
  Loader2,
  Search,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Provider, ProviderStatus } from "@/lib/all-types";
import { initials } from "@/lib/helpers";

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
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  suspend: {
    label: "Suspend",
    confirmTitle: "Suspend this provider?",
    confirmDesc: (n) =>
      `${n} will be suspended immediately. No new bookings can be made, but active ones won't be affected.`,
    variant: "destructive",
    icon: <ShieldAlert className="h-3.5 w-3.5" />,
    menuClassName: "text-destructive focus:text-destructive",
  },
  reject: {
    label: "Reject application",
    confirmTitle: "Reject this application?",
    confirmDesc: (n) =>
      `${n}'s application will be rejected. The owner will be notified and may reapply.`,
    variant: "destructive",
    icon: <XCircle className="h-3.5 w-3.5" />,
    menuClassName: "text-destructive focus:text-destructive",
  },
  reactivate: {
    label: "Reactivate",
    confirmTitle: "Reactivate this provider?",
    confirmDesc: (n) =>
      `${n} will be reactivated and become visible to users again.`,
    variant: "default",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  verify: {
    label: "Mark as verified",
    confirmTitle: "Mark as verified?",
    confirmDesc: (n) =>
      `${n} will receive a verified badge. Confirm that all documents have been reviewed before proceeding.`,
    variant: "default",
    icon: <ShieldCheck className="h-3.5 w-3.5" />,
  },
  view: {
    label: "View details",
    confirmTitle: "",
    confirmDesc: () => "",
    variant: "outline",
    icon: <ChevronRight className="h-3.5 w-3.5" />,
  },
};

type ActionType =
  | "approve"
  | "suspend"
  | "reject"
  | "reactivate"
  | "verify"
  | "view";

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
      <TableCell colSpan={7} className="h-48 text-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Search className="h-8 w-8 opacity-20" />
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {query ? `No results for "${query}"` : "No providers found"}
            </p>
            <p className="text-xs opacity-60">
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
