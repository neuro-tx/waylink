"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  CheckCircle2,
  XCircle,
  Star,
  CheckCheck,
  Megaphone,
  AlertTriangle,
  Tag,
  ShieldCheck,
  ShieldX,
  ShieldOff,
  BellOff,
  ChevronLeft,
  ChevronRight,
  Info,
  UserPlus,
} from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { Notification } from "@/db/schemas";
import { NotificationType } from "@/lib/all-types";
import { Skeleton } from "@/components/ui/skeleton";
import { timeAgo } from "@/lib/utils";

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
  n,
  onRead,
  index,
  disabled = false,
}: {
  n: Notification;
  onRead: (id: string) => void;
  index: number;
  disabled?: boolean;
}) {
  const cfg = TYPE_CONFIG[n.type];
  const Icon = cfg.icon;

  const handleRead = () => {
    if (!n.isRead && !disabled) {
      onRead(n.id);
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
      className={`
        relative flex items-start gap-3.5 px-4 py-3.5 rounded-xl
        border transition-colors duration-150 select-none overflow-hidden
        ${
          n.isRead
            ? "bg-background border-border/40 hover:bg-muted/30 cursor-auto"
            : "bg-card border-border hover:bg-accent/80 cursor-pointer"
        }
      `}
    >
      <AnimatePresence>
        {!n.isRead && (
          <motion.div
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            exit={{ scaleY: 0, opacity: 0 }}
            className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-primary"
            style={{ transformOrigin: "top" }}
          />
        )}
      </AnimatePresence>

      <motion.div
        transition={{ duration: 0.15 }}
        className={`
          shrink-0 mt-0.5 w-9 h-9 rounded-lg border
          flex items-center justify-center transition-all duration-150
          ${
            n.isRead
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
              n.isRead ? "text-muted-foreground/40" : cfg.color
            }`}
          >
            {cfg.label}
          </span>
          <span className="text-muted-foreground/25">·</span>
          <span className="text-muted-foreground/40">
            {timeAgo(n.createdAt)}
          </span>
        </div>

        <p
          className={`text-sm leading-snug mb-1 truncate ${
            n.isRead
              ? "text-muted-foreground font-normal"
              : "text-foreground font-medium"
          }`}
        >
          {n.title}
        </p>

        <p className="text-sm text-muted-foreground/55 leading-relaxed line-clamp-2">
          {n.message}
        </p>
      </div>

      <AnimatePresence>
        {!n.isRead && (
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

export default function NotificationsPage() {
  const {
    notifications: items,
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
  } = useNotifications();

  const [filter, setFilter] = useState<"all" | "unread">("all");
  const filtered = filter === "unread" ? items.filter((n) => !n.isRead) : items;

  return (
    <div className="min-h-screen bg-card/70 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mb-7"
        >
          <div className="flex items-center justify-between mb-5">
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

          <div className="flex items-center justify-between">
            <div className="flex gap-0.5 p-1 rounded-lg bg-muted/50 border border-border/60">
              {(["all", "unread"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="relative px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                >
                  {filter === f && (
                    <motion.div
                      layoutId="pill"
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
                    {f === "unread"
                      ? `Unread${unreadCount > 0 ? ` (${unreadCount})` : ""}`
                      : "All"}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <AnimatePresence mode="popLayout">
                {unreadCount > 0 && (
                  <motion.button
                    key="mark-all"
                    initial={{ opacity: 0, x: 6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 6 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={markAllAsRead}
                    disabled={isActionPending}
                    className="text-sm text-foreground transition-colors px-2 py-1.5 rounded-md hover:bg-muted disabled:opacity-40 border"
                  >
                    Mark all read
                  </motion.button>
                )}

                {filter === "all" && items.some((n) => n.isRead) && (
                  <motion.button
                    key="clear-read"
                    initial={{ opacity: 0, x: 6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 6 }}
                    onClick={clearRead}
                    disabled={isActionPending}
                    className="text-sm text-destructive transition-colors px-2 py-1.5 rounded-md hover:bg-destructive/8 disabled:opacity-40 border border-destructive/20"
                  >
                    Clear read
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        <motion.div layout className="flex flex-col gap-2">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3.5 p-4 rounded-xl border border-border/40 bg-card"
              >
                <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <Skeleton className="h-2.5 w-24 rounded" />
                  <Skeleton className="h-3.5 w-3/4 rounded" />
                  <Skeleton className="h-2.5 w-full rounded" />
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
                  transition={{ duration: 0.22 }}
                  className="flex flex-col items-center justify-center py-20"
                >
                  <div className="w-11 h-11 rounded-2xl bg-muted border border-border flex items-center justify-center text-muted-foreground mb-3">
                    <BellOff size={20} strokeWidth={1.5} />
                  </div>
                  <p className="text-base font-medium text-forground">
                    Nothing here
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {filter === "unread"
                      ? "All caught up!"
                      : "No notifications yet"}
                  </p>
                </motion.div>
              ) : (
                filtered.map((n, i) => (
                  <NotificationRow
                    key={n.id}
                    n={n}
                    onRead={markAsRead}
                    index={i}
                    disabled={isActionPending}
                  />
                ))
              )}
            </AnimatePresence>
          )}
        </motion.div>

        <AnimatePresence>
          {!isLoading && filtered.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between mt-8"
            >
              <p className="text-sm text-muted-foreground">
                {filtered.length} notification{filtered.length !== 1 ? "s" : ""}
              </p>

              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <motion.button
                    onClick={prevPage}
                    disabled={page === 1 || isActionPending}
                    className="w-8 h-8 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 isabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={14} strokeWidth={2.5} />
                  </motion.button>

                  {Array.from({ length: totalPages }).map((_, i) => {
                    const p = i + 1;
                    const isActive = p === page;
                    const show =
                      p === 1 || p === totalPages || Math.abs(p - page) <= 1;

                    if (!show) {
                      const prevShow =
                        p - 1 === 1 ||
                        p - 1 === totalPages ||
                        Math.abs(p - 1 - page) <= 1;
                      return prevShow ? (
                        <span
                          key={p}
                          className="w-8 h-8 flex items-center justify-center text-xs text-muted-foreground/40"
                        >
                          ···
                        </span>
                      ) : null;
                    }

                    return (
                      <motion.button
                        key={p}
                        onClick={() => goToPage(p)}
                        disabled={isActionPending}
                        className={`w-8 h-8 flex items-center justify-center rounded-md text-xs font-medium transition-colors disabled:opacity-40
                  ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                      >
                        {p}
                      </motion.button>
                    );
                  })}

                  <motion.button
                    onClick={nextPage}
                    disabled={page === totalPages || isActionPending}
                    className="w-8 h-8 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={14} strokeWidth={2.5} />
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
