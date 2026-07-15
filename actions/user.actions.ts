"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { APIError } from "better-auth/api";

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

export async function getAllUsers(search?: string) {
  try {
    const result = await auth.api.listUsers({
      query: {
        searchField: search?.includes("@") ? "email" : "name",
        searchOperator: "contains",
        searchValue: search,
        limit: 50,
      },
      headers: await headers(),
    });

    return { success: true, data: result.users, error: null };
  } catch (error) {
    console.error("getUsers failed:", error);
    return {
      success: false,
      data: null,
      error: "Couldn't load users. Please try again.",
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
