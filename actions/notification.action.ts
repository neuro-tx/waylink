"use server";

import { db } from "@/db";
import { Notification, notifications, user } from "@/db/schemas";
import { NotificationType } from "@/lib/all-types";
import { getAuthSession } from "@/lib/auth-server";
import { and, count, desc, eq } from "drizzle-orm";

type GetNotificationsResult =
  | { success: true; data: Notification[]; unreadCount: number; total: number }
  | { success: false; error: string };

type ActionResult = { success: true } | { success: false; error: string };

export async function getNotifications(
  limit = 20,
  offset = 0,
): Promise<GetNotificationsResult> {
  try {
    const session = await getAuthSession();

    if (!session) return { success: false, error: "Unauthorized" };

    const [rows, [{ value: unreadCount }], [{ value: total }]] =
      await Promise.all([
        db
          .select()
          .from(notifications)
          .where(eq(notifications.userId, session.user.id))
          .orderBy(desc(notifications.createdAt))
          .limit(limit)
          .offset(offset),

        db
          .select({ value: count() })
          .from(notifications)
          .where(
            and(
              eq(notifications.userId, session.user.id),
              eq(notifications.isRead, false),
            ),
          ),

        db
          .select({ value: count() })
          .from(notifications)
          .where(eq(notifications.userId, session.user.id)),
      ]);

    return {
      success: true,
      data: rows as Notification[],
      unreadCount: Number(unreadCount),
      total: Number(total),
    };
  } catch {
    return { success: false, error: "Failed to fetch notifications" };
  }
}

export async function markAsRead(
  notificationId: string,
): Promise<ActionResult> {
  try {
    const session = await getAuthSession();
    if (!session) return { success: false, error: "Unauthorized" };

    await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, session.user.id),
        ),
      );

    return { success: true };
  } catch {
    return { success: false, error: "Failed to mark as read" };
  }
}

export async function markAllAsRead(): Promise<ActionResult> {
  try {
    const session = await getAuthSession();
    if (!session) return { success: false, error: "Unauthorized" };

    await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(
        and(
          eq(notifications.userId, session.user.id),
          eq(notifications.isRead, false),
        ),
      );

    return { success: true };
  } catch {
    return { success: false, error: "Failed to mark all as read" };
  }
}

export async function deleteNotification(
  notificationId: string,
): Promise<ActionResult> {
  try {
    const session = await getAuthSession();
    if (!session) return { success: false, error: "Unauthorized" };

    await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, session.user.id),
        ),
      );

    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete notification" };
  }
}

export async function clearReadNotifications(): Promise<ActionResult> {
  try {
    const session = await getAuthSession();
    if (!session) return { success: false, error: "Unauthorized" };

    await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.userId, session.user.id),
          eq(notifications.isRead, true),
        ),
      );

    return { success: true };
  } catch {
    return { success: false, error: "Failed to clear notifications" };
  }
}

export async function sendNotification(payload: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
}): Promise<ActionResult> {
  try {
    await db.insert(notifications).values({
      userId: payload.userId,
      type: payload.type,
      title: payload.title,
      message: payload.message,
    });

    return { success: true };
  } catch {
    return { success: false, error: "Failed to send notification" };
  }
}

export async function broadcastAnnouncement({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  const session = await getAuthSession();
  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }

  const allUsers = await db.select({ id: user.id }).from(user);
  if (allUsers.length === 0) return { success: true, count: 0 };

  await db.insert(notifications).values(
    allUsers.map((u) => ({
      userId: u.id,
      type: "system_announcement" as const,
      title,
      message,
    })),
  );

  return { success: true, count: allUsers.length };
}
