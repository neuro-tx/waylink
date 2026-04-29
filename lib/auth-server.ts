import { headers } from "next/headers";
import { auth } from "./auth";

export const getAuthSession = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    return session ?? null;
  } catch (error) {
    return null;
  }
};
