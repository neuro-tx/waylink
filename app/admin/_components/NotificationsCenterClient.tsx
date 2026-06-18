"use client";

import { useState } from "react";
import {
  Bell,
  BellOff,
  CheckCheck,
  Megaphone,
  Plus,
  Trash2,
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
  Circle,
  MoreHorizontal,
  Send,
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
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { fmtDateTime } from "@/lib/helpers";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotificationType } from "@/lib/all-types";
import { Notification } from "@/db/schemas";
import {
  DeleteDialog,
  RecipientBadge,
  SendNotificationDialog,
  TypeBadge,
} from "./NotificationsLayout";
import { RecipientType } from "@/hooks/useNotifications";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

function NotificationDetail({
  notification,
  onClose,
  onMarkRead,
  onDelete,
}: {
  notification: Notification | null;
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  if (!notification) return null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between border-b p-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Notification Detail
          </p>
          <h3 className="font-semibold">{notification.title}</h3>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          className="rounded-full"
          onClick={onClose}
        >
          <X className="size-4" />
        </Button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        <div className="flex flex-wrap gap-1">
          <TypeBadge type={notification.type} />
          <RecipientBadge type={notification.recipientType} />
          {!notification.isRead && (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary font-mono">
              <Circle className="size-2 fill-current" />
              Unread
            </span>
          )}
        </div>

        <div className="rounded-lg border bg-muted/40 p-3">
          <p className="text-sm text-foreground leading-relaxed">
            {notification.message}
          </p>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Recipient ID</span>
            <span className="font-mono text-xs">
              {notification.recipientId}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sent</span>
            <span>{notification.createdAt.toLocaleString()}</span>
          </div>
          {notification.readAt && (
            <>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Read at</span>
                <span>{fmtDateTime(notification.readAt)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-2 border-t p-4">
        {!notification.isRead && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2"
            onClick={() => onMarkRead(notification.id)}
          >
            <CheckCheck className="size-4" />
            Mark as read
          </Button>
        )}
        <Button
          variant="destructive"
          size="sm"
          className="gap-2"
          onClick={() => {
            onDelete(notification.id);
            onClose();
          }}
        >
          <Trash2 className="size-4" />
          Delete
        </Button>
      </div>
    </div>
  );
}

export default function NotificationCenterPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<NotificationType | "all">("all");
  const [filterRecipient, setFilterRecipient] = useState<RecipientType | "all">(
    "all",
  );
  const [filterRead, setFilterRead] = useState<"all" | "read" | "unread">(
    "all",
  );
  const [sendOpen, setSendOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeNotif, setActiveNotif] = useState<Notification | null>(null);
  const [recipientId, setRecipientId] = useState<string | null>(null);

  const filtered = notifications.filter((n) => {
    const matchType = filterType === "all" || n.type === filterType;
    const matchRecipient =
      filterRecipient === "all" || n.recipientType === filterRecipient;
    const matchRead =
      filterRead === "all" || (filterRead === "read" ? n.isRead : !n.isRead);
    return matchType && matchRecipient && matchRead;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const activeFilters = [
    filterType !== "all",
    filterRecipient !== "all",
    filterRead !== "all",
  ].filter(Boolean).length;

  // ── Actions ──────────────────────────────────────────────────────────────────

  function markOneRead(id: string) {
    const now = new Date();
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, isRead: true, readAt: now, updatedAt: now } : n,
      ),
    );
    setActiveNotif((prev) =>
      prev?.id === id
        ? { ...prev, isRead: true, readAt: now, updatedAt: now }
        : prev,
    );
  }

  function deleteSelected() {
    const ids = new Set(selected);
    setNotifications((prev) => prev.filter((n) => !ids.has(n.id)));
    setSelected(new Set());
    setDeleteOpen(false);
    if (activeNotif && ids.has(activeNotif.id)) setActiveNotif(null);
  }

  function deleteOne(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  function handleSend(
    payload: Omit<
      Notification,
      "id" | "createdAt" | "updatedAt" | "isRead" | "readAt"
    >,
  ) {
    const now = new Date();
    const newNotif: Notification = {
      id: `n${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      isRead: false,
      readAt: null,
      ...payload,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  }

  function clearFilters() {
    setFilterType("all");
    setFilterRecipient("all");
    setFilterRead("all");
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-5 overflow-auto px-4 md:px-6 py-6">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <Bell className="size-5 text-amber-500" />
                <h1 className="text-xl font-semibold tracking-tight">
                  Notification Center
                </h1>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-primary text-xs font-semibold text-primary-foreground size-5 grid place-items-center shrink-0">
                    {unreadCount}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Send, track, and manage all platform notifications
              </p>
            </div>

            <Button
              size="sm"
              className="gap-2"
              onClick={() => setSendOpen(true)}
            >
              <Plus className="size-4" />
              Send Notification
            </Button>
          </div>
        </div>

        <Separator />

        <div className="flex flex-wrap items-center gap-2 bg-background">
          <Select
            value={filterType}
            onValueChange={(v) => setFilterType(v as typeof filterType)}
          >
            <SelectTrigger className="h-8 w-52 text-sm">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <Separator />
              {(Object.keys(TYPE_META) as NotificationType[]).map((t) => {
                const meta = TYPE_META[t];
                const Icon = meta.icon;
                return (
                  <SelectItem key={t} value={t}>
                    <span className="flex items-center gap-2">
                      <Icon className="size-3.5 text-muted-foreground" />
                      {meta.label}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          {/* Recipient filter */}
          <Select
            value={filterRecipient}
            onValueChange={(v) =>
              setFilterRecipient(v as typeof filterRecipient)
            }
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

          {/* Read status */}
          <Select
            value={filterRead}
            onValueChange={(v) => setFilterRead(v as typeof filterRead)}
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

          {activeFilters > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-muted-foreground"
              onClick={clearFilters}
            >
              <X className="size-3.5" />
              Clear ({activeFilters})
            </Button>
          )}

          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="flex min-h-0 w-full">
          <div
            className={cn(
              "min-w-0 flex-1 h-full",
              activeNotif ? "rounded-r-none" : "rounded-t-md",
              "transition-all border border-b-0",
            )}
          >
            <Table className="table-auto w-full">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[40%] px-3">
                    Title &amp; Message
                  </TableHead>
                  <TableHead className="w-48">Type</TableHead>
                  <TableHead className="w-28">Audience</TableHead>
                  <TableHead className="w-36 hidden lg:table-cell">
                    Sent
                  </TableHead>
                  <TableHead className="w-40 hidden lg:table-cell">
                    Read At
                  </TableHead>
                  <TableHead className="w-20 text-left">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <BellOff className="size-8 opacity-40" />
                        <p className="text-sm font-medium">
                          No notifications found
                        </p>
                        <p className="text-xs">
                          {activeFilters > 0
                            ? "Try adjusting your filters"
                            : "Send your first notification to get started"}
                        </p>
                        {activeFilters > 0 && (
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
                {filtered.map((n) => (
                  <TableRow
                    key={n.id}
                    className={cn(
                      "transition-colors",
                      !n.isRead && "bg-primary/3",
                      activeNotif?.id === n.id && "bg-accent",
                    )}
                  >
                    <TableCell className="w-[40%] px-3">
                      <p
                        className={cn("text-sm", !n.isRead && "font-semibold")}
                      >
                        {n.title}
                      </p>
                      <p className="text-xs hidden lg:inline-flex text-muted-foreground line-clamp-1 wrap-break-word">
                        {n.message}
                      </p>
                    </TableCell>

                    <TableCell>
                      <TypeBadge type={n.type} />
                    </TableCell>

                    <TableCell>
                      <RecipientBadge type={n.recipientType} />
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">
                      {n.createdAt.toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                      <br />
                      {n.createdAt.toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">
                      {n.readAt ? (
                        fmtDateTime(n.readAt)
                      ) : (
                        <span className="text-amber-500 font-mono">Unread</span>
                      )}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="cursor-pointer"
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuGroup>
                            <DropdownMenuItem
                              onClick={() => setRecipientId(n.recipientId)}
                            >
                              <Send className="size-4 text-sky-500" />
                              Send Notification
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setActiveNotif(n)}>
                              <Info className="size-4 text-amber-500" />
                              View detail
                            </DropdownMenuItem>
                            {!n.isRead && (
                              <DropdownMenuItem
                                onClick={() => markOneRead(n.id)}
                              >
                                <CheckCheck className="size-4 text-emerald-500" />
                                Mark as read
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuGroup>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive bg-destructive/5 focus:bg-destructive/10 dark:bg-destructive/10 dark:focus:bg-destructive/20"
                            onClick={() => deleteOne(n.id)}
                          >
                            <Trash2 className="size-4 text-destructive" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {activeNotif && (
            <ScrollArea className="h-full border border-b-0 w-90 shrink-0 hidden lg:inline-flex transition-all">
              <NotificationDetail
                notification={activeNotif}
                onClose={() => setActiveNotif(null)}
                onMarkRead={markOneRead}
                onDelete={(id) => {
                  deleteOne(id);
                  setActiveNotif(null);
                }}
              />
            </ScrollArea>
          )}
        </div>
      </div>

      {/* ─── Dialogs ─── */}
      <SendNotificationDialog
        open={sendOpen}
        onClose={() => setSendOpen(false)}
        onSend={handleSend}
        recipientId={recipientId}
      />
      <DeleteDialog
        count={selected.size}
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={deleteSelected}
      />
    </TooltipProvider>
  );
}
