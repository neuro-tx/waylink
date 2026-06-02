"use server";

import { db } from "@/db";
import { Notification, notifications, user } from "@/db/schemas";
import { RecipientType } from "@/hooks/useNotifications";
import { protectAction } from "@/lib/aj-actions";
import { NotificationType } from "@/lib/all-types";
import { getAuthSession } from "@/lib/auth-server";
import { and, count, desc, eq } from "drizzle-orm";

type GetNotificationsResult =
  | { success: true; data: Notification[]; unreadCount: number; total: number }
  | { success: false; error: string };

type ActionResult = { success: true } | { success: false; error: string };

interface NotificationsOpts {
  recipientId?: string;
  recipientType?: RecipientType;
  pagination?: {
    limit?: number;
    offset?: number;
  };
}

async function resolveRecipientId(
  recipientId?: string,
  recipientType?: RecipientType,
): Promise<
  { success: true; recipientId: string } | { success: false; error: string }
> {
  if (recipientId) {
    return {
      success: true,
      recipientId,
    };
  }

  const guard = await protectAction(recipientType as any);
  if (!guard.ok) {
    return {
      success: false,
      error: guard.message || "Security system unavailable. Try again later.",
    };
  }

  const session = await getAuthSession();
  if (!session) {
    return {
      success: false,
      error: "Unauthorized",
    };
  }

  return {
    success: true,
    recipientId: session.user.id,
  };
}

export async function getNotifications({
  recipientId,
  recipientType,
  pagination,
}: NotificationsOpts): Promise<GetNotificationsResult> {
  const limit = pagination?.limit ?? 20;
  const offset = pagination?.offset ?? 0;

  try {
    const resolved = await resolveRecipientId(recipientId, recipientType);
    if (!resolved.success) {
      return {
        success: false,
        error: resolved.error,
      };
    }

    const targetRecipientId = resolved.recipientId;

    const [rows, [{ value: unreadCount }], [{ value: total }]] =
      await Promise.all([
        db
          .select()
          .from(notifications)
          .where(
            and(
              eq(notifications.recipientId, targetRecipientId),
              eq(notifications.recipientType, recipientType ?? "user"),
            ),
          )
          .orderBy(desc(notifications.createdAt))
          .limit(limit)
          .offset(offset),

        db
          .select({ value: count() })
          .from(notifications)
          .where(
            and(
              eq(notifications.recipientId, targetRecipientId),
              eq(notifications.isRead, false),
            ),
          ),

        db
          .select({ value: count() })
          .from(notifications)
          .where(and(eq(notifications.recipientId, targetRecipientId))),
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
  recipientId?: string,
): Promise<ActionResult> {
  try {
    const resolved = await resolveRecipientId(recipientId, "admin");
    if (!resolved.success) {
      return {
        success: false,
        error: resolved.error,
      };
    }

    const targetRecipientId = resolved.recipientId;

    await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.recipientId, targetRecipientId),
        ),
      );

    return { success: true };
  } catch {
    return { success: false, error: "Failed to mark as read" };
  }
}

export async function markAllAsRead(
  recipientId?: string,
): Promise<ActionResult> {
  try {
    const resolved = await resolveRecipientId(recipientId, "admin");
    if (!resolved.success) {
      return {
        success: false,
        error: resolved.error,
      };
    }

    const targetRecipientId = resolved.recipientId;

    await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(
        and(
          eq(notifications.recipientId, targetRecipientId),
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
  recipientId?: string,
): Promise<ActionResult> {
  try {
    const resolved = await resolveRecipientId(recipientId, "admin");
    if (!resolved.success) {
      return {
        success: false,
        error: resolved.error,
      };
    }

    const targetRecipientId = resolved.recipientId;

    await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.recipientId, targetRecipientId),
        ),
      );

    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete notification" };
  }
}

export async function clearReadNotifications(
  recipientId?: string,
): Promise<ActionResult> {
  try {
    const resolved = await resolveRecipientId(recipientId, "admin");
    if (!resolved.success) {
      return {
        success: false,
        error: resolved.error,
      };
    }

    const targetRecipientId = resolved.recipientId;

    await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.recipientId, targetRecipientId),
          eq(notifications.isRead, true),
        ),
      );

    return { success: true };
  } catch {
    return { success: false, error: "Failed to clear notifications" };
  }
}

export async function sendNotification(payload: {
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  recipient?: "user" | "provider" | "admin";
}): Promise<ActionResult> {
  try {
    await db.insert(notifications).values({
      recipientId: payload.recipientId,
      recipientType: payload.recipient || "user",
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
  scope = "user",
}: {
  title: string;
  message: string;
  scope?: "user" | "provider" | "admin";
}) {
  const session = await getAuthSession();
  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }

  const allUsers = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.role, scope));
  if (allUsers.length === 0) return { success: true, count: 0 };

  await db.insert(notifications).values(
    allUsers.map((u) => ({
      recipientId: u.id,
      type: "system_announcement" as const,
      title,
      message,
      recipientType: scope ?? "user",
    })),
  );

  return { success: true, count: allUsers.length };
}
