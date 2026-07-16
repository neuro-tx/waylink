"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { APIError } from "better-auth/api";
import { db } from "@/db";
import { user } from "@/db/schemas";
import { ilike, or, sql } from "drizzle-orm";
import { Pagination, User } from "@/lib/all-types";

type TimeUnit = "h" | "m" | "d" | "mo" | "w";
const timeMap: Record<TimeUnit, number> = {
  d: 86400,
  h: 3600,
  m: 60,
  mo: 2592000,
  w: 604800,
};

const revokeBanDuration = (opts?: {
  duration: string | undefined;
  unit: TimeUnit | undefined;
}): number | undefined => {
  const { duration, unit } = opts || {};

  if (!duration || !unit) return undefined;
  return timeMap[unit] * +duration;
};

const banErrorMessages: Record<string, string> = {
  USER_NOT_FOUND:
    "We couldn't find that user. They may have already been removed.",
  YOU_CANNOT_BAN_YOURSELF: "You can't ban your own account.",
  FAILED_TO_UPDATE_USER:
    "Something went wrong updating this user. Please try again.",
};

const unbanErrorMessages: Record<string, string> = {
  ...banErrorMessages,
  USER_NOT_BANNED: "This user isn't currently banned.",
};

const roleErrorMessages: Record<string, string> = {
  USER_NOT_FOUND:
    "We couldn't find that user. They may have already been removed.",
  FORBIDDEN: "You don't have permission to change this user's role.",
  FAILED_TO_UPDATE_USER:
    "Something went wrong updating this user's role. Please try again.",
};

const deleteErrorMessages: Record<string, string> = {
  USER_NOT_FOUND:
    "We couldn't find that user. They may have already been removed.",
  FORBIDDEN: "You don't have permission to delete this user.",
  FAILED_TO_DELETE_USER:
    "Something went wrong deleting this user. Please try again.",
};

type ActionResult =
  | { success: true; error: null }
  | { success: false; error: string };

export async function getAllUsers(search?: string, page = 1) {
  try {
    const limit = 20;
    const offset = (page - 1) * limit;

    const [count, users] = await Promise.all([
      db.select({ total: sql<number>`count(*)` }).from(user),
      db
        .select()
        .from(user)
        .where(
          search
            ? or(
                ilike(user.name, `%${search}%`),
                ilike(user.email, `%${search}%`),
              )
            : undefined,
        )
        .limit(limit)
        .offset(offset),
    ]);

    const total = Number(count[0]?.total ?? 0);
    const pagination:Pagination= {
      total,
      limit,
      offset,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(total / limit),
      hasNextPage: offset + limit < total,
      hasPrevPage: offset > 0,
    };

    return { success: true, data: { users: users as User[], pagination }, error: null };
  } catch (error) {
    console.error("getUsers failed:", error);
    return {
      success: false,
      data: null,
      error: "Couldn't load users. Please try again.",
    };
  }
}

export async function userAnalysis() {
  try {
    const [result] = await db
      .select({
        total: sql<number>`count(*)::int`,
        activeCount: sql<number>`count(*) filter (where ${user.banned} = false)::int`,
        bannedCount: sql<number>`count(*) filter (where ${user.banned} = true)::int`,
        admins: sql<number>`count(*) filter (where ${user.role} = 'admin')::int`,
        providers: sql<number>`count(*) filter (where ${user.role} = 'provider')::int`,
        permanentBans: sql<number>`count(*) filter (where ${user.banned} = true and ${user.banExpires} is null)`,
        temporaryBans: sql<number>`count(*) filter (where ${user.banned} = true and ${user.banExpires} is not null)`,
      })
      .from(user);

    return { success: true, data: result, error: null };
  } catch (error) {
    console.error("userAnalysis failed:", error);
    return {
      success: false,
      data: null,
      error: "Couldn't load user stats. Please try again.",
    };
  }
}

export async function banUser(
  userId: string,
  banReason?: string,
  ban?: {
    duration: string;
    unit: TimeUnit;
  },
): Promise<ActionResult> {
  const banExpiresIn = revokeBanDuration(ban);

  try {
    await auth.api.banUser({
      body: {
        userId,
        banExpiresIn,
        banReason,
      },
      headers: await headers(),
    });

    return { success: true, error: null };
  } catch (error) {
    if (error instanceof APIError) {
      const code = error.body?.code as string | undefined;
      const friendly =
        (code && unbanErrorMessages[code]) ||
        error.body?.message ||
        "We couldn't ban this user. Please try again.";

      return { success: false, error: friendly };
    }

    console.error("banUser failed:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function unbanUser(userId: string): Promise<ActionResult> {
  try {
    await auth.api.unbanUser({
      body: { userId },
      headers: await headers(),
    });

    return { success: true, error: null };
  } catch (error) {
    if (error instanceof APIError) {
      const code = error.body?.code as string | undefined;
      const friendly =
        (code && banErrorMessages[code]) ||
        error.body?.message ||
        "We couldn't unban this user. Please try again.";

      return { success: false, error: friendly };
    }

    console.error("unbanUser failed:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function changeUserRole(
  userId: string,
  role: "admin" | "user" | "provider",
): Promise<ActionResult> {
  try {
    await auth.api.setRole({
      body: {
        userId,
        role,
      },
      headers: await headers(),
    });

    return { success: true, error: null };
  } catch (error) {
    if (error instanceof APIError) {
      const code = error.body?.code as string | undefined;
      const friendly =
        (code && roleErrorMessages[code]) ||
        error.body?.message ||
        "We couldn't update this user's role. Please try again.";

      return { success: false, error: friendly };
    }

    console.error("changeUserRole failed:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function deleteUser(userId: string): Promise<ActionResult> {
  try {
    await auth.api.removeUser({
      body: { userId },
      headers: await headers(),
    });

    return { success: true, error: null };
  } catch (error) {
    if (error instanceof APIError) {
      const code = error.body?.code as string | undefined;
      const friendly =
        (code && deleteErrorMessages[code]) ||
        error.body?.message ||
        "We couldn't delete this user. Please try again.";

      return { success: false, error: friendly };
    }

    console.error("deleteUser failed:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
