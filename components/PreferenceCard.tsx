"use client";

import {
  LayoutDashboard,
  ShieldCheck,
  Store,
  Loader2,
  Info,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useRef, useState, useEffect, useCallback } from "react";
import {
  getDashboardPreference,
  setDashboardPreference,
} from "@/actions/preference.action";

type UserRole = "admin" | "provider" | (string & {});
type SaveStatus = "idle" | "saving" | "saved" | "error";

const ROLE_CONTENT: Record<
  string,
  { label: string; icon: React.ElementType; badge: string }
> = {
  admin: {
    label: "Automatically open my Admin Dashboard",
    icon: ShieldCheck,
    badge: "Admin",
  },
  provider: {
    label: "Automatically open my Provider Dashboard",
    icon: Store,
    badge: "Provider",
  },
};

function getRoleContent(role: UserRole) {
  return (
    ROLE_CONTENT[role] ?? {
      label: "Automatically open my Dashboard",
      icon: LayoutDashboard,
      badge: role,
    }
  );
}

export function PreferenceCard({ role }: { role: UserRole }) {
  const { label, icon: RoleIcon, badge } = getRoleContent(role);

  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const requestIdRef = useRef(0);

  useEffect(() => {
    return () => clearTimeout(savedTimeoutRef.current);
  }, []);

  useEffect(() => {
    async function check() {
      const signture = await getDashboardPreference();

      setEnabled(signture);
    }

    check();
  }, []);

  const handleToggle = useCallback(
    async (next: boolean) => {
      const requestId = ++requestIdRef.current;
      const previous = enabled;

      setEnabled(next);
      setStatus("saving");
      clearTimeout(savedTimeoutRef.current);

      try {
        await setDashboardPreference(next);
        if (requestIdRef.current !== requestId) return;
        setStatus("saved");
        savedTimeoutRef.current = setTimeout(() => {
          setStatus((current) => (current === "saved" ? "idle" : current));
        }, 2000);
      } catch {
        if (requestIdRef.current !== requestId) return;
        setEnabled(previous);
        setStatus("error");
        savedTimeoutRef.current = setTimeout(() => {
          setStatus((current) => (current === "error" ? "idle" : current));
        }, 3000);
      }
    },
    [enabled],
  );

  const isSaving = status === "saving";

  return (
    <Card className="relative overflow-hidden border-amber-500/40 shadow-sm transition-shadow duration-300 bg-amber-500/5">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-amber-500/50 to-transparent"
      />

      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center transition-colors bg-amber-500/10 rounded-full">
            <RoleIcon className="size-6 text-amber-500" aria-hidden />
          </div>
          <div>
            <p className="text-base font-semibold leading-none tracking-tight">
              Navigation preference
            </p>
            <p className="mt-1 text-xs text-amber-500">
              Manage where you're taken when opening the app.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex flex-col gap-4 rounded-lg border border-amber-500/50 bg-amber-500/10 p-4 transition-colors duration-300 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5 pr-0 sm:pr-6">
            <Label
              htmlFor="auto-open-dashboard"
              className="text-base font-medium text-amber-800 dark:text-amber-400"
            >
              {label}
            </Label>
            <p className="text-sm leading-relaxed text-muted-foreground">
              When enabled, visiting the homepage automatically redirects you to
              your dashboard. When disabled, the homepage is shown normally.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3 self-start sm:self-center">
            {isSaving && (
              <Loader2
                className="h-4 w-4 animate-spin text-muted-foreground"
                aria-hidden
              />
            )}
            <Switch
              id="auto-open-dashboard"
              checked={enabled}
              disabled={isSaving}
              onCheckedChange={handleToggle}
              aria-label={label}
              aria-describedby="auto-open-dashboard-helper auto-open-dashboard-status"
              className="data-[state=checked]:bg-amber-500"
            />
          </div>
        </div>

        <div className="mt-3 flex items-start justify-between gap-3">
          <p
            id="auto-open-dashboard-helper"
            className="flex items-start gap-1.5 text-xs text-muted-foreground"
          >
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            This only affects navigation. It does not change your account
            permissions or access.
          </p>

          <div
            id="auto-open-dashboard-status"
            role="status"
            aria-live="polite"
            className={cn(
              "flex shrink-0 items-center gap-1 text-xs font-medium transition-opacity duration-300",
              status === "idle" || status === "saving"
                ? "opacity-0"
                : "opacity-100",
            )}
          >
            {status === "saved" && (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                Saved
              </span>
            )}
            {status === "error" && (
              <span className="flex items-center gap-1 text-destructive">
                <AlertCircle className="h-3.5 w-3.5" aria-hidden />
                Couldn't save — reverted
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
