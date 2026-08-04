"use client";

import { motion, useReducedMotion } from "motion/react";
import { ShieldCheck } from "lucide-react";

export function RoleCheckLoader() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="flex h-svh flex-col items-center justify-center gap-5">
      <div className="relative flex h-16 w-16 items-center justify-center">
        {!prefersReducedMotion && (
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-[oklch(0.55_0.22_293)] border-r-[oklch(0.55_0.22_293)]"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}
        <span className="absolute inset-0 rounded-full bg-[oklch(0.55_0.22_293)]/10 blur-md" />
        <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm dark:bg-zinc-900">
          <ShieldCheck className="h-5 w-5 text-[oklch(0.55_0.22_293)]" />
        </div>
      </div>

      <div className="text-center">
        <h2 className="font-semibold">Verifying access</h2>
        <p className="text-sm text-muted-foreground">
          Checking your permissions...
        </p>
      </div>
    </div>
  );
}
