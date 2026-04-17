import { cache } from "react";
import { getAuthSession } from "./auth-server";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { providerMembers } from "@/db/schemas";
import { Provider } from "./all-types";

type Role = "owner" | "manager" | "staff" | null;

type ProviderState =
  | {
      status: "unauthorized";
      user: null;
      provider: null;
      role: Role;
    }
  | {
      status: "no-provider";
      user: any;
      provider: null;
      role: Role;
    }
  | {
      status: "banned";
      user: any;
      provider: null;
      role: Role;
      reason?: string | null;
    }
  | {
      status: "ok";
      user: any;
      provider: Provider;
      role: Role;
    };

export const getCurrentProvider = cache(async (): Promise<ProviderState> => {
  const session = await getAuthSession();

  if (!session?.user?.id)
    return {
      status: "unauthorized",
      user: null,
      provider: null,
      role: null,
    };

  const res = await db.query.providerMembers.findFirst({
    where: eq(providerMembers.userId, session.user.id),
    with: {
      provider: true,
      user: true,
    },
  });

  if (!res || !res.provider) {
    return {
      status: "no-provider",
      user: session.user,
      provider: null,
      role: null,
    };
  }

  if (res.user?.banned) {
    return {
      status: "banned",
      user: res.user,
      provider: null,
      role: null,
      reason: res.user.banReason,
    };
  }

  return {
    status: "ok",
    user: res.user,
    provider: res.provider as Provider,
    role: res.role,
  };
});
