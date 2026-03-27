"use client";

import { Session } from "@/lib/all-types";
import { authClient } from "@/lib/auth-client";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export const useUserSessions = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [error, setError] = useState<string | null>(null);

  const getCurrentSession = useCallback(async () => {
    try {
      const { data, error } = await authClient.getSession();
      if (error) {
        throw new Error(error.message);
      }
      return {
        user: data?.user ?? null,
        session: data?.session ?? null,
      };
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
      return null;
    }
  }, []);

  const getSessions = useCallback(async () => {
    try {
      const us = await getCurrentSession();
      if (!us?.user) throw new Error("user session not found");

      const { data, error } = await authClient.listSessions();
      if (error) {
        throw new Error(error.message);
      }

      setSessions(data ?? []);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    }
  }, []);

  const revokeSession = useCallback(async (sessionToken: string) => {
    try {
      setError(null);

      const currentSession = await getCurrentSession();
      if (!currentSession?.session) throw new Error("No active session found");
      const { error } = await authClient.revokeSession({
        token: sessionToken,
      });
      if (error) {
        throw new Error(error.message);
      }

      toast.success("Session revoked successfully");
      setSessions((prev) =>
        prev.filter((session) => session.token !== sessionToken),
      );
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    }
  }, []);

  const revokeAllSessions = useCallback(async () => {
    try {
      setError(null);
      const currentSession = await getCurrentSession();
      if (!currentSession?.session) throw new Error("No active session found");

      const { data, error } = await authClient.revokeOtherSessions({});
      if (error) throw new Error(error.message);

      if (!data.status) {
        toast.error("Faild to revoke.");
        return;
      }

      toast.success("All other sessions revoked successfully");
      setSessions((prev) =>
        prev.filter((s) => s.token === currentSession.session?.token),
      );
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    }
  }, [sessions, getCurrentSession]);

  const deleteAcount = async () => {
    setError(null);
    try {
      const us = await getCurrentSession();
      if (!us?.user) throw new Error("Permision desnied");

      const { error } = await authClient.deleteUser();

      if (error) throw new Error(error.message);
      return { success: true };
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
      return { success: false };
    }
  };

  return {
    sessions,
    error,
    revokeSession,
    revokeAllSessions,
    getCurrentSession,
    getSessions,
    deleteAcount,
  };
};
