"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Bell,
  BellOff,
  Megaphone,
  Plus,
  X,
  AlertTriangle,
  Info,
  Tag,
  CalendarCheck,
  CalendarX,
  Star,
  ShieldCheck,
  ShieldX,
  UserPlus,
  ShieldAlert,
  RefreshCw,
  Loader,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { NotificationType } from "@/lib/all-types";
import { Notification } from "@/db/schemas";
import {
  DeleteDialog,
  NotificationDetail,
  NotificationRow,
  SendNotificationDialog,
  useUrlFilters,
} from "./NotificationsLayout";
import { useNotifications } from "@/hooks/useNotifications";

export const TYPE_META: Record<
  NotificationType,
  { label: string; icon: React.ElementType; color: string }
> = {
  booking_confirmed: {
    label: "Booking Confirmed",
    icon: CalendarCheck,
    color:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  booking_cancelled: {
    label: "Booking Cancelled",
    icon: CalendarX,
    color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  },
  booking_completed: {
    label: "Booking Completed",
    icon: CalendarCheck,
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  review_received: {
    label: "Review Received",
    icon: Star,
    color:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  provider_approved: {
    label: "Provider Approved",
    icon: ShieldCheck,
    color:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  provider_rejected: {
    label: "Provider Rejected",
    icon: ShieldX,
    color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  },
  provider_invite: {
    label: "Provider Invite",
    icon: UserPlus,
    color:
      "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  },
  provider_suspended: {
    label: "Provider Suspended",
    icon: ShieldAlert,
    color:
      "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  },
  system_announcement: {
    label: "System Announcement",
    icon: Megaphone,
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  system_warning: {
    label: "System Warning",
    icon: AlertTriangle,
    color:
      "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  },
  promotion: {
    label: "Promotion",
    icon: Tag,
    color: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
  },
  general: {
    label: "General",
    icon: Info,
    color:
      "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  },
};

export default function NotificationCenterPage() {
  const { filters, setFilter, clearFilters, activeCount } = useUrlFilters();
  const [sendOpen, setSendOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [activeNotif, setActiveNotif] = useState<Notification | null>(null);
  const [recipientId, setRecipientId] = useState<string | null>(null);

  const filter = useMemo(
    () => ({
      type: filters.type !== "all" ? filters.type : undefined,
      recipientType:
        filters.recipient !== "all" ? filters.recipient : undefined,
      isRead:
        filters.read === "read"
          ? true
          : filters.read === "unread"
            ? false
            : undefined,
    }),
    [filters],
  );

  const {
    notifications,
    error,
    page,
    deleteNotification,
    empty,
    isLoading,
    isActionPending,
    refresh,
    total,
    nextPage,
    prevPage,
    totalPages,
    unreadCount,
    clearError,
    addNewItem,
  } = useNotifications({
    recipient: "admin",
    ignoreRole: true,
    filter,
  });

  const activeNotifFresh = useMemo(
    () =>
      activeNotif
        ? (notifications.find((n) => n.id === activeNotif.id) ?? activeNotif)
        : null,
    [activeNotif, notifications],
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteNotification(id);
      setDeleteTarget(null);
      if (activeNotif?.id === id) setActiveNotif(null);
    },
    [deleteNotification, activeNotif],
  );

  const openDeleteDialog = useCallback((id: string) => {
    setDeleteTarget(id);
  }, []);

  const openSendForRecipient = useCallback((rid: string) => {
    setRecipientId(rid);
    setSendOpen(true);
  }, []);

  const handleRowClick = useCallback((n: Notification) => {
    setActiveNotif((prev) => (prev?.id === n.id ? null : n));
  }, []);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-5 overflow-auto px-4 md:px-6 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <Bell className="size-5 text-amber-500" />
              <h1 className="text-xl font-semibold tracking-tight">
                Notification Center
              </h1>
              {unreadCount > 0 && (
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Send, track, and manage all platform notifications
            </p>
          </div>

          <div className="flex items-center ml-auto md:ml-0 gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={refresh}
                  disabled={isLoading}
                >
                  <RefreshCw
                    className={cn(
                      "size-4 shrink-0",
                      isLoading && "animate-spin",
                    )}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh</TooltipContent>
            </Tooltip>

            <Button
              size="sm"
              className="gap-2"
              disabled={isLoading}
              onClick={() => {
                setRecipientId(null);
                setSendOpen(true);
              }}
            >
              <Plus className="size-4" />
              Send Notification
            </Button>
          </div>
        </div>

        <Separator />

        {error && (
          <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
            <span>{error}</span>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-destructive hover:text-destructive"
              onClick={clearError}
            >
              <X className="size-4" />
            </Button>
          </div>
        )}

        {isActionPending && (
          <div className="flex items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-amber-700 dark:text-amber-400">
            <Loader className="size-4 animate-spin shrink-0" />

            <div className="flex flex-col">
              <span className="text-sm font-medium">Action in progress</span>

              <span className="text-xs opacity-80">
                Deleting notification, please wait...
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={filters.type}
            onValueChange={(v) => setFilter("type", v)}
          >
            <SelectTrigger className="h-8 w-52 text-sm">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <Separator />
              {(Object.keys(TYPE_META) as NotificationType[]).map((t) => {
                const { icon: Icon, label } = TYPE_META[t];
                return (
                  <SelectItem key={t} value={t}>
                    <span className="flex items-center gap-2">
                      <Icon className="size-3.5 text-muted-foreground" />
                      {label}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <Select
            value={filters.recipient}
            onValueChange={(v) => setFilter("recipient", v)}
          >
            <SelectTrigger className="h-8 w-36 text-sm">
              <SelectValue placeholder="All audiences" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All audiences</SelectItem>
              <SelectItem value="user">Users</SelectItem>
              <SelectItem value="provider">Providers</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.read}
            onValueChange={(v) => setFilter("read", v)}
          >
            <SelectTrigger className="h-8 w-32 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
            </SelectContent>
          </Select>

          {activeCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-muted-foreground"
              onClick={clearFilters}
            >
              <X className="size-3.5" />
              Clear ({activeCount})
            </Button>
          )}

          <div className="ml-auto flex items-center gap-3 text-sm text-muted-foreground">
            {isLoading ? (
              <Loader className="size-4 animate-spin" />
            ) : (
              <span>
                {total} notification{total !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        <div className="flex min-h-0 w-full">
          <div
            className={cn(
              "min-w-0 flex-1 overflow-x-hidden transition-all border border-b-0",
              activeNotif ? "rounded-l-md rounded-r-none" : "rounded-md",
            )}
          >
            <Table className="w-full table-fixed">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-80 px-3">
                    Title &amp; Message
                  </TableHead>
                  <TableHead className="w-48">Type</TableHead>
                  <TableHead className="w-28">Audience</TableHead>
                  <TableHead className="hidden w-36 lg:table-cell">
                    Sent
                  </TableHead>
                  <TableHead className="hidden w-40 lg:table-cell">
                    Read At
                  </TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={`skel-${i}`} className="animate-pulse">
                      <TableCell className="px-3">
                        <div className="h-3 w-48 rounded bg-muted" />
                        <div className="mt-1.5 h-2.5 w-72 rounded bg-muted/60" />
                      </TableCell>
                      <TableCell>
                        <div className="h-5 w-28 rounded-md bg-muted" />
                      </TableCell>
                      <TableCell>
                        <div className="h-5 w-16 rounded-md bg-muted" />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="h-3 w-20 rounded bg-muted" />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="h-3 w-20 rounded bg-muted" />
                      </TableCell>
                      <TableCell>
                        <div className="size-7 rounded-md bg-muted" />
                      </TableCell>
                    </TableRow>
                  ))}

                {!isLoading && empty && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <BellOff className="size-8 opacity-40" />
                        <p className="text-sm font-medium">
                          No notifications found
                        </p>
                        <p className="text-xs">
                          {activeCount > 0
                            ? "Try adjusting your filters"
                            : "Send your first notification to get started"}
                        </p>
                        {activeCount > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-1"
                            onClick={clearFilters}
                          >
                            Clear filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading &&
                  notifications.map((n) => (
                    <NotificationRow
                      key={n.id}
                      notification={n}
                      isActive={activeNotif?.id === n.id}
                      onRowClick={handleRowClick}
                      onSend={openSendForRecipient}
                      onDelete={openDeleteDialog}
                      isActionPending={isActionPending}
                    />
                  ))}
              </TableBody>
            </Table>
          </div>

          {activeNotifFresh && (
            <div className="sticky top-0 max-h-[calc(100svh-100px)] w-95 shrink-0 hidden xl:flex flex-col border border-b-0 rounded-r-md transition-all overflow-hidden">
              <NotificationDetail
                notification={activeNotifFresh}
                onClose={() => setActiveNotif(null)}
                onDelete={openDeleteDialog}
              />
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t pt-4 text-sm text-muted-foreground">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={prevPage}
                disabled={page <= 1 || isLoading}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={nextPage}
                disabled={page >= totalPages || isLoading}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Dialogs ─── */}
      <SendNotificationDialog
        open={sendOpen}
        onClose={() => setSendOpen(false)}
        recipientId={recipientId}
        onComplete={(item) => item && addNewItem(item)}
      />

      <DeleteDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
      />
    </TooltipProvider>
  );
}
