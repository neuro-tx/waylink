"use client";

import { NotificationType } from "@/lib/all-types";
import {
  AlertTriangle,
  Bell,
  BellOff,
  CheckCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Info,
  Megaphone,
  ShieldCheck,
  ShieldOff,
  ShieldX,
  Star,
  Tag,
  UserPlus,
  XCircle,
} from "lucide-react";
import { Notification } from "@/db/schemas";
import { motion, AnimatePresence } from "framer-motion";
import { cn, timeAgo } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";
import { useMemo, useState } from "react";
import { RecipientType, useNotifications } from "@/hooks/useNotifications";

type Filter = "all" | "unread";

interface NotificationsFiltersProps {
  filter: Filter;
  unreadCount: number;
  hasRead: boolean;
  pending?: boolean;
  onFilterChange: (filter: Filter) => void;
  onMarkAllRead: () => void;
  onClearRead: () => void;
}

interface NotificationsListProps {
  notifications: Notification[];
  loading: boolean;
  empty: boolean;
  disabled?: boolean;
  onRead: (id: string) => void;
}

interface NotificationsPaginationProps {
  page: number;
  totalPages: number;
  count: number;
  pending?: boolean;
  onPrev: () => void;
  onNext: () => void;
  onPageChange: (page: number) => void;
}

const TYPE_CONFIG: Record<
  NotificationType,
  {
    icon: React.ElementType;
    label: string;
    color: string;
    bg: string;
    border: string;
  }
> = {
  booking_confirmed: {
    icon: CheckCircle2,
    label: "Confirmed",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/60",
    border: "border-emerald-200 dark:border-emerald-800/60",
  },
  booking_cancelled: {
    icon: XCircle,
    label: "Cancelled",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/60",
    border: "border-red-200 dark:border-red-800/60",
  },
  booking_completed: {
    icon: CheckCheck,
    label: "Completed",
    color: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-50 dark:bg-teal-950/60",
    border: "border-teal-200 dark:border-teal-800/60",
  },
  review_received: {
    icon: Star,
    label: "Review",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/60",
    border: "border-amber-200 dark:border-amber-800/60",
  },
  provider_approved: {
    icon: ShieldCheck,
    label: "Approved",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/60",
    border: "border-emerald-200 dark:border-emerald-800/60",
  },
  provider_rejected: {
    icon: ShieldX,
    label: "Rejected",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/60",
    border: "border-red-200 dark:border-red-800/60",
  },
  provider_suspended: {
    icon: ShieldOff,
    label: "Suspended",
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-950/60",
    border: "border-orange-200 dark:border-orange-800/60",
  },
  system_announcement: {
    icon: Megaphone,
    label: "Announcement",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/60",
    border: "border-blue-200 dark:border-blue-800/60",
  },
  system_warning: {
    icon: AlertTriangle,
    label: "Warning",
    color: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-50 dark:bg-yellow-950/60",
    border: "border-yellow-200 dark:border-yellow-800/60",
  },
  promotion: {
    icon: Tag,
    label: "Promotion",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/60",
    border: "border-violet-200 dark:border-violet-800/60",
  },
  general: {
    icon: Info,
    label: "General",
    color: "text-gray-600 dark:text-gray-400",
    bg: "bg-gray-50 dark:bg-gray-950/60",
    border: "border-gray-200 dark:border-gray-800/60",
  },
  provider_invite: {
    icon: UserPlus,
    label: "Provider Invite",
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-950/60",
    border: "border-indigo-200 dark:border-indigo-800/60",
  },
};

function NotificationRow({
  notification,
  onRead,
  index,
  disabled = false,
}: {
  notification: Notification;
  onRead: (id: string) => void;
  index: number;
  disabled?: boolean;
}) {
  const cfg = TYPE_CONFIG[notification.type];
  const Icon = cfg.icon;

  const handleRead = () => {
    if (!notification.isRead && !disabled) {
      onRead(notification.id);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -12, scale: 0.97, transition: { duration: 0.18 } }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
      onClick={handleRead}
      className={cn(
        "relative w-full flex items-start gap-3.5 px-4 py-3.5 rounded-xl border transition-colors duration-150 select-none overflow-hidden",
        notification.isRead
          ? "bg-background border-amber-500/50 cursor-auto"
          : "bg-card hover:bg-accent/80 hover:border-emerald-500/50 cursor-pointer shadow-sm",
      )}
    >
      <motion.div
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        exit={{ scaleY: 0, opacity: 0 }}
        className={cn(
          "absolute left-0 top-3 bottom-3 w-1 rounded-r-full ",
          notification.isRead ? "bg-amber-500/50" : "bg-emerald-500",
        )}
        style={{ transformOrigin: "top" }}
      />

      <motion.div
        transition={{ duration: 0.15 }}
        className={`
          shrink-0 mt-0.5 w-9 h-9 rounded-lg border
          flex items-center justify-center transition-all duration-150
          ${
            notification.isRead
              ? "opacity-35 bg-muted border-border/40 text-muted-foreground"
              : `${cfg.bg} ${cfg.border} ${cfg.color}`
          }
        `}
      >
        <Icon size={16} strokeWidth={2} />
      </motion.div>

      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-center text-xs gap-1.5 mb-1">
          <span
            className={`text-sm font-semibold tracking-wider uppercase ${
              notification.isRead ? "text-amber-800/70" : cfg.color
            }`}
          >
            {cfg.label}
          </span>
          <span className="text-muted-foreground/25">·</span>
          <span className="text-muted-foreground/40">
            {timeAgo(notification.createdAt)}
          </span>
        </div>

        <p
          className={`text-sm leading-snug mb-1 truncate ${
            notification.isRead
              ? "text-muted-foreground font-normal"
              : "text-foreground font-medium"
          }`}
        >
          {notification.title}
        </p>

        <p className="text-sm text-muted-foreground/55 md:leading-relaxed line-clamp-2">
          {notification.message}
        </p>
      </div>

      <AnimatePresence>
        {!notification.isRead && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
            className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-primary"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function NotificationsHeader({ unreadCount }: { unreadCount: number }) {
  return (
    <div className="w-full flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <Bell size={17} strokeWidth={2} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-foreground tracking-tight leading-none">
              Notifications
            </h1>
            <AnimatePresence mode="popLayout">
              {unreadCount > 0 && (
                <motion.span
                  key="badge"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 24,
                  }}
                  className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold tabular-nums"
                >
                  {unreadCount}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <motion.p
            key={unreadCount}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="text-xs text-muted-foreground mt-1"
          >
            {unreadCount === 0
              ? "You're all caught up"
              : `${unreadCount} unread`}
          </motion.p>
        </div>
      </div>
    </div>
  );
}

function NotificationsFilters({
  filter,
  unreadCount,
  hasRead,
  pending,
  onFilterChange,
  onMarkAllRead,
  onClearRead,
}: NotificationsFiltersProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex gap-0.5 p-1 rounded-lg bg-muted/50 border border-border/60">
        {(["all", "unread"] as const).map((f) => (
          <button
            key={f}
            onClick={() => onFilterChange(f)}
            className="relative px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
          >
            {filter === f && (
              <motion.div
                layoutId="notification-filter-pill"
                className="absolute inset-0 rounded-md bg-background shadow-sm border border-border/70"
                transition={{
                  type: "spring",
                  stiffness: 420,
                  damping: 32,
                }}
              />
            )}

            <span
              className={`relative z-10 transition-colors ${
                filter === f ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {f === "all"
                ? "All"
                : `Unread${unreadCount ? ` (${unreadCount})` : ""}`}
            </span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <AnimatePresence mode="popLayout">
          {unreadCount > 0 && (
            <motion.button
              key="mark-all"
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 6 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              disabled={pending}
              onClick={onMarkAllRead}
              className="px-3 py-1.5 text-sm rounded-md border hover:bg-muted transition-colors disabled:opacity-40"
            >
              Mark all read
            </motion.button>
          )}

          {filter === "all" && hasRead && (
            <motion.button
              key="clear-read"
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 6 }}
              disabled={pending}
              onClick={onClearRead}
              className="px-3 py-1.5 text-sm rounded-md border border-destructive/20 text-destructive hover:bg-destructive/5 transition-colors disabled:opacity-40"
            >
              Clear read
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function NotificationsList({
  notifications,
  loading,
  empty,
  disabled,
  onRead,
}: NotificationsListProps) {
  return (
    <motion.div layout className="flex flex-col gap-2">
      {loading ? (
        Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-3.5 p-4 rounded-xl border bg-card"
          >
            <Skeleton className="w-9 h-9 rounded-lg shrink-0" />

            <div className="flex-1 space-y-2 pt-1">
              <Skeleton className="h-2.5 w-24" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
            </div>
          </motion.div>
        ))
      ) : (
        <AnimatePresence mode="popLayout">
          {empty ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="w-11 h-11 rounded-2xl bg-muted border flex items-center justify-center text-muted-foreground mb-3">
                <BellOff size={20} />
              </div>

              <p className="font-medium">Nothing here</p>

              <p className="text-sm text-muted-foreground mt-1">
                No notifications available
              </p>
            </motion.div>
          ) : (
            notifications.map((notification, index) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                index={index}
                disabled={disabled}
                onRead={onRead}
              />
            ))
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
}

export function NotificationsPagination({
  page,
  totalPages,
  count,
  pending,
  onPrev,
  onNext,
  onPageChange,
}: NotificationsPaginationProps) {
  if (count === 0) return null;

  return (
    <div className="flex items-center justify-between mt-8">
      <p className="text-sm text-muted-foreground">
        {count} notification{count !== 1 ? "s" : ""}
      </p>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={onPrev}
            disabled={page === 1 || pending}
            className="w-8 h-8 rounded-md border flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30"
          >
            <ChevronLeft size={14} />
          </button>

          {Array.from({ length: totalPages }).map((_, i) => {
            const current = i + 1;

            const show =
              current === 1 ||
              current === totalPages ||
              Math.abs(current - page) <= 1;

            if (!show) {
              const prevVisible =
                current - 1 === 1 ||
                current - 1 === totalPages ||
                Math.abs(current - 1 - page) <= 1;

              return prevVisible ? (
                <span
                  key={current}
                  className="w-8 h-8 flex items-center justify-center text-xs text-muted-foreground"
                >
                  ...
                </span>
              ) : null;
            }

            const active = current === page;

            return (
              <motion.button
                key={current}
                whileTap={{ scale: 0.95 }}
                disabled={pending}
                onClick={() => onPageChange(current)}
                className={`w-8 h-8 rounded-md text-xs font-medium transition-colors
                  ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "border hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
              >
                {current}
              </motion.button>
            );
          })}

          <button
            onClick={onNext}
            disabled={page === totalPages || pending}
            className="w-8 h-8 rounded-md border flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

export function NotificationsClientPage({
  recipient,
  recipientId,
  limit,
}: {
  recipient: RecipientType;
  recipientId?: string;
  limit?: number;
}) {
  const {
    notifications,
    unreadCount,
    isLoading,
    isActionPending,
    empty,
    markAsRead,
    markAllAsRead,
    clearRead,
    page,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
  } = useNotifications({ recipient, recipientId, limit });

  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filtered = useMemo(() => {
    if (filter === "all") return notifications;

    return notifications.filter((n) => !n.isRead);
  }, [notifications, filter]);

  return (
    <div className="w-full overflow-x-hidden relative">
      <NotificationsHeader unreadCount={unreadCount} />

      <NotificationsFilters
        filter={filter}
        onFilterChange={setFilter}
        unreadCount={unreadCount}
        hasRead={notifications.some((n) => n.isRead)}
        pending={isActionPending}
        onMarkAllRead={markAllAsRead}
        onClearRead={clearRead}
      />

      <NotificationsList
        notifications={filtered}
        loading={isLoading}
        empty={empty}
        disabled={isActionPending}
        onRead={markAsRead}
      />

      <NotificationsPagination
        page={page}
        totalPages={totalPages}
        count={filtered.length}
        pending={isActionPending}
        onNext={nextPage}
        onPrev={prevPage}
        onPageChange={goToPage}
      />
    </div>
  );
}
