"use server";

import { cookies } from "next/headers";
import { getAuthSession } from "@/lib/auth-server";
import {
  COOKIE_NAME,
  MAX_AGE,
  encodeDashboardPreference,
  decode,
} from "@/lib/preference";

export async function setDashboardPreference(enabled: boolean) {
  const session = await getAuthSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, encodeDashboardPreference(enabled), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function getDashboardPreference(): Promise<boolean> {
  const cookieStore = await cookies();

  return decode(cookieStore.get(COOKIE_NAME)?.value);
}
