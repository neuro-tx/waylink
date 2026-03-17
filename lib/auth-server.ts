import { headers } from "next/headers";
import { auth } from "./auth";

export const getAuthSession = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null
  }

  return session;
};