"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { RoleCheckLoader } from "./RoleCheckLoader";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/unauthorized");
    }
  }, [loading, user, router]);

  if (loading) {
    return <RoleCheckLoader />;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
