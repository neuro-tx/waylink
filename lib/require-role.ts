import { redirect } from "next/navigation";
import { getAuthSession } from "./auth-server";

export type Role = "admin" | "provider" | "user";

export async function requireRole(allowed: Role[], redirectTo: string = "/") {
  const session = await getAuthSession();

  if (!session) {
    redirect("/");
  }

  const role = session.user.role as Role;

  if (!allowed.includes(role)) {
    redirect(redirectTo);
  }

  return session;
}
