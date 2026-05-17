"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { SetupProgress } from "@/lib/all-types";
import { getServiceSetup } from "@/actions/service.action";

type SetupProgressContextType = {
  progress: SetupProgress | null;
  loading: boolean;
  syncProgress: () => Promise<void>;
  updateProgress: (data: Partial<SetupProgress>) => void;
};

const SetupProgressContext = createContext<SetupProgressContextType | null>(
  null,
);

export function SetupProgressProvider({
  children,
  serviceId,
}: {
  children: React.ReactNode;
  serviceId?: string;
}) {
  const [progress, setProgress] = useState<SetupProgress | null>(null);
  const [loading, setLoading] = useState(true);

  async function syncProgress() {
    if (!serviceId) {
      setLoading(false);
      return;
    }

    try {
      const res = await getServiceSetup(serviceId);
      setProgress(res ?? null);
    } finally {
      setLoading(false);
    }
  }

  function updateProgress(data: Partial<SetupProgress>) {
    setProgress((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        ...data,
      };
    });
  }

  useEffect(() => {
    syncProgress();
  }, [serviceId]);

  const value = useMemo(
    () => ({
      progress,
      loading,
      syncProgress,
      updateProgress,
    }),
    [progress, loading],
  );

  return (
    <SetupProgressContext.Provider value={value}>
      {children}
    </SetupProgressContext.Provider>
  );
}

export function useSetupProgress() {
  const ctx = useContext(SetupProgressContext);

  if (!ctx) {
    throw new Error(
      "useSetupProgress must be used inside SetupProgressProvider",
    );
  }

  return ctx;
}
