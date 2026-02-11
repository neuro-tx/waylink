"use client";

import { Toaster } from "sonner";
import { useTheme } from "next-themes";

export function ThemedToaster() {
  const { theme } = useTheme();

  return <Toaster theme={theme as "light" | "dark"} richColors />;
}
