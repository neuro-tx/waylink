import { cache } from "react";
import { getAuthSession } from "./auth-server";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { providerMembers } from "@/db/schemas";
import { Provider } from "./all-types";
import { unstable_cache } from "next/cache";

type Role = "owner" | "manager" | "staff" | null;

type ProviderState = {
  status: "ok" | "unauthorized";
  user: any | null;
  provider: Provider | null;
  role: Role;
};

export async function getCurrentProvider(): Promise<ProviderState> {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return {
        status: "unauthorized",
        user: null,
        provider: null,
        role: null,
      };
    }

    const getCached = unstable_cache(
      async (userId: string): Promise<ProviderState> => {
        const res = await db.query.providerMembers.findFirst({
          where: eq(providerMembers.userId, userId),
          with: {
            provider: true,
            user: true,
          },
        });

        if (!res?.provider) {
          return {
            status: "unauthorized",
            user: res?.user ?? null,
            provider: null,
            role: null,
          };
        }

        return {
          status: "ok",
          user: res.user,
          provider: res.provider as Provider,
          role: res.role ?? null,
        };
      },
      ["current-provider", session.user.id],
      { revalidate: 60 },
    );

    return getCached(session.user.id);
  } catch {
    return {
      status: "unauthorized",
      user: null,
      provider: null,
      role: null,
    };
  }
}
