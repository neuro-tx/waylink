import {
  clearReadNotifications,
  deleteNotification,
  getNotifications,
  markAllAsRead,
  markAsRead,
} from "@/actions/notification.action";
import { Notification } from "@/db/schemas";
import { useCallback, useEffect, useState, useTransition } from "react";

type State = {
  notifications: Notification[];
  unreadCount: number;
  total: number;
  isLoading: boolean;
  isActionPending: boolean;
  error: string | null;
  empty: boolean;
};

export function useNotifications(limit = 20) {
  const [page, setPage] = useState(1);
  const [state, setState] = useState<State>({
    notifications: [],
    unreadCount: 0,
    isLoading: true,
    isActionPending: false,
    error: null,
    total: 0,
    empty: true,
  });

  const [isPending, startTransition] = useTransition();
  const totalPages = Math.max(1, Math.ceil(state.total / limit));

  const fetch = useCallback(
    async (p: number) => {
      setState((s) => ({ ...s, isLoading: true, error: null }));

      const result = await getNotifications(limit, (p - 1) * limit);

      if (result.success) {
        setState((s) => ({
          ...s,
          notifications: result.data,
          unreadCount: result.unreadCount,
          total: result.total,
          isLoading: false,
          empty: result.data.length === 0,
        }));
      } else {
        setState((s) => ({ ...s, isLoading: false, error: result.error }));
      }
    },
    [limit],
  );

  useEffect(() => {
    fetch(page);
  }, [page, limit]);

  const goToPage = useCallback((p: number) => {
    setPage(p);
  }, []);

  const nextPage = useCallback(() => {
    setPage((p) => Math.min(p + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage((p) => Math.max(p - 1, 1));
  }, []);

  const handleMarkAsRead = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) =>
        n.id === id && !n.isRead
          ? { ...n, isRead: true, readAt: new Date(), updatedAt: new Date() }
          : n,
      ),
      unreadCount: s.notifications.find((n) => n.id === id && !n.isRead)
        ? Math.max(0, s.unreadCount - 1)
        : s.unreadCount,
    }));

    startTransition(async () => {
      const result = await markAsRead(id);
      if (!result.success) {
        setState((s) => ({
          ...s,
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, isRead: false, readAt: null } : n,
          ),
          unreadCount: s.unreadCount + 1,
          error: result.error,
          empty: false,
        }));
      }
    });
  }, []);

  const handleMarkAllAsRead = useCallback(() => {
    const now = new Date();

    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) =>
        n.isRead ? n : { ...n, isRead: true, readAt: now, updatedAt: now },
      ),
      unreadCount: 0,
    }));

    startTransition(async () => {
      const result = await markAllAsRead();
      if (!result.success) {
        fetch(page);
        setState((s) => ({ ...s, error: result.error }));
      }
    });
  }, [fetch]);

  const handleDelete = useCallback(
    (id: string) => {
      const target = state.notifications.find((n) => n.id === id);
      if (!target) return;

      setState((s) => ({
        ...s,
        notifications: s.notifications.filter((n) => n.id !== id),
        unreadCount: !target.isRead
          ? Math.max(0, s.unreadCount - 1)
          : s.unreadCount,
      }));

      startTransition(async () => {
        const result = await deleteNotification(id);
        if (!result.success) {
          setState((s) => ({
            ...s,
            notifications: [...s.notifications, target].sort(
              (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
            ),
            unreadCount: !target.isRead ? s.unreadCount + 1 : s.unreadCount,
            error: result.error,
            empty: false,
          }));
        }
      });
    },
    [state.notifications],
  );

  const handleClearRead = useCallback(() => {
    const removed = state.notifications.filter((n) => n.isRead);

    setState((s) => ({
      ...s,
      notifications: s.notifications.filter((n) => !n.isRead),
      empty: false,
    }));

    startTransition(async () => {
      const result = await clearReadNotifications();
      if (!result.success) {
        setState((s) => ({
          ...s,
          notifications: [...s.notifications, ...removed].sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
          ),
          error: result.error,
          empty: false,
        }));
      }
    });
  }, [state.notifications]);

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  return {
    // State
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    total: state.total,
    isLoading: state.isLoading,
    isActionPending: isPending,
    error: state.error,
    empty: state.empty,
    // Pagination
    page,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    // Actions
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    deleteNotification: handleDelete,
    clearRead: handleClearRead,
    refresh: () => fetch(page),
    clearError,
  };
}
