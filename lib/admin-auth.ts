import { User } from "./all-types";
import { getAuthSession } from "./auth-server";

type ProviderState = {
  status: "ok" | "NA";
  admin: User | null;
};

export async function adminAuth(): Promise<ProviderState> {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return {
        status: "NA",
        admin: null,
      };
    }

    return {
      status: "ok",
      admin: session.user,
    };
  } catch (error) {
    return {
      status: "NA",
      admin: null,
    };
  }
}
