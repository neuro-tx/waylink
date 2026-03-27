"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Clock,
  Globe,
  Loader2,
  LogOut,
  MapPin,
  Monitor,
  Smartphone,
  Tablet,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { timeAgo } from "@/lib/utils";
import { useUserSessions } from "@/hooks/useSession";
import { fmtDate } from "@/lib/utils";
import { Session } from "@/lib/all-types";
import { toast } from "sonner";

type SessionState = "active" | "valid" | "expiring_soon" | "expired";

function parseUserAgent(ua: string | null | undefined): {
  browser: string;
  os: string;
  device: "desktop" | "mobile" | "tablet";
} {
  if (!ua) return { browser: "Unknown", os: "Unknown", device: "desktop" };
  const isMobile = /Mobile/i.test(ua) && !/iPad/i.test(ua);
  const isTablet = /iPad|Tablet/i.test(ua);
  const device = isTablet ? "tablet" : isMobile ? "mobile" : "desktop";
  const browser = /Chrome/i.test(ua)
    ? "Chrome"
    : /Firefox/i.test(ua)
      ? "Firefox"
      : /Safari/i.test(ua)
        ? "Safari"
        : /Edge/i.test(ua)
          ? "Edge"
          : "Browser";
  const os = /Windows/i.test(ua)
    ? "Windows"
    : /Android/i.test(ua)
      ? "Android"
      : /Linux/i.test(ua)
        ? "Linux"
        : /iPad|iPhone|Mac/i.test(ua)
          ? "Apple"
          : "OS";
  return { browser, os, device };
}

function getSessionState(
  entry: Session,
  isCurrent = false,
  expiringSoonHours = 24,
): SessionState {
  const now = new Date();
  const expiresAt = entry.expiresAt ? new Date(entry.expiresAt) : null;

  if (expiresAt && expiresAt <= now) {
    return "expired";
  }

  if (isCurrent) {
    return "active";
  }

  if (expiresAt) {
    const diffMs = expiresAt.getTime() - now.getTime();
    const expiringSoonMs = expiringSoonHours * 60 * 60 * 1000;

    if (diffMs > 0 && diffMs <= expiringSoonMs) {
      return "expiring_soon";
    }
  }

  return "valid";
}

export function ProfileSessions() {
  const {
    sessions,
    error,
    getCurrentSession,
    revokeSession,
    revokeAllSessions,
    getSessions,
  } = useUserSessions();

  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [revokingToken, setRevokingToken] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const [current] = await Promise.all([getCurrentSession(), getSessions()]);
      if (current?.session?.token) {
        setCurrentToken(current.session.token);
      }
      setIsLoading(false);
    };

    init();
  }, [getSessions, getCurrentSession]);

  const currentEntry = sessions.find((e) => e.token === currentToken);
  const otherEntries = sessions.filter((e) => e.token !== currentToken);

  const handleRevoke = async (token: string) => {
    setRevokingToken(token);
    await revokeSession(token);
    setRevokingToken(null);
  };

  const handleRevokeAll = async () => {
    setRevokingAll(true);
    await revokeAllSessions();
    setRevokingAll(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) toast.error(error);

  console.log(sessions);

  return (
    <div className="space-y-6">
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke session?</AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately sign out this device from your account.
              {currentEntry && (
                <span className="text-destructive">
                  {parseUserAgent(currentEntry.userAgent).browser} on{" "}
                  {parseUserAgent(currentEntry.userAgent).os}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setConfirmOpen(false);
              }}
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleRevokeAll}
              disabled={!!revokingToken}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {revokingToken ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Revoking...
                </>
              ) : (
                "Revoke All"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="border-border/50">
        <CardHeader className="flex-row flex items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Current Session</CardTitle>
            <CardDescription>
              Your active authenticated session.
            </CardDescription>
          </div>
          <Badge className="border mt-1.5 border-emerald-500/25 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400">
            This device
          </Badge>
        </CardHeader>
        <CardContent>
          {currentEntry ? (
            <SessionCard entry={currentEntry} isCurrent />
          ) : (
            <p className="text-sm text-muted-foreground">
              No active session found.
            </p>
          )}
        </CardContent>
      </Card>

      {otherEntries.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="flex-row flex items-start justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Other Sessions</CardTitle>
              <CardDescription>
                {otherEntries.length} other active{" "}
                {otherEntries.length === 1 ? "session" : "sessions"}.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmOpen(true)}
              disabled={revokingAll}
              className="shrink-0 gap-2 text-sm"
            >
              {revokingAll ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Revoking...
                </>
              ) : (
                <>
                  <LogOut className="h-3.5 w-3.5" />
                  Revoke all others
                </>
              )}
            </Button>
          </CardHeader>

          <CardContent className="space-y-3">
            <AnimatePresence initial={false}>
              {otherEntries.map((entry) => (
                <motion.div
                  key={entry.token}
                  initial={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <SessionCard
                    entry={entry}
                    onRevoke={() => handleRevoke(entry.token)}
                    isRevoking={revokingToken === entry.token}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </CardContent>
        </Card>
      )}

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Login History</CardTitle>
          <CardDescription>All sessions sorted by recency.</CardDescription>
        </CardHeader>

        <CardContent className="divide-y divide-border/40">
          {sessions
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            )
            .map((entry) => {
              const { browser, os, device } = parseUserAgent(entry?.userAgent);
              const isCurrent = entry.token === currentToken;
              const DeviceIcon =
                device === "mobile"
                  ? Smartphone
                  : device === "tablet"
                    ? Tablet
                    : Monitor;

              return (
                <div
                  key={entry.token}
                  className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <DeviceIcon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {browser} on {os}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      {entry.ipAddress && (
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {entry.ipAddress}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {timeAgo(String(entry.createdAt))}
                      </span>
                    </div>
                  </div>

                  {isCurrent ? (
                    <Badge
                      variant="secondary"
                      className="shrink-0 text-emerald-500 text-xs"
                    >
                      Current
                    </Badge>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      expires {fmtDate(entry.expiresAt)}
                    </span>
                  )}
                </div>
              );
            })}
        </CardContent>
      </Card>
    </div>
  );
}

function SessionCard({
  entry,
  isCurrent = false,
  onRevoke,
  isRevoking,
}: {
  entry: Session;
  isCurrent?: boolean;
  onRevoke?: () => void;
  isRevoking?: boolean;
}) {
  const { browser, os, device } = parseUserAgent(entry?.userAgent);
  const DeviceIcon =
    device === "mobile" ? Smartphone : device === "tablet" ? Tablet : Monitor;

  const sessionState = getSessionState(entry, isCurrent);
  const stateMeta = getSessionStateMeta(sessionState);

  return (
    <div className="flex items-start gap-4 rounded-xl border border-border/50 bg-muted/20 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <DeviceIcon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">
            {browser} on {os}
          </p>

          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${stateMeta.className}`}
          >
            {stateMeta.label}
          </span>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {entry.ipAddress && (
            <span className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              {entry.ipAddress}
            </span>
          )}

          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Started {timeAgo(String(entry.createdAt))}
          </span>

          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            Expires {fmtDate(entry.expiresAt)}
          </span>
        </div>
      </div>

      {!isCurrent && onRevoke && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRevoke}
          disabled={isRevoking || sessionState === "expired"}
          className="shrink-0 gap-1.5 text-xs text-muted-foreground hover:text-destructive"
        >
          {isRevoking ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <XCircle className="h-3.5 w-3.5" />
          )}
          {sessionState === "expired" ? "Expired" : "Revoke"}
        </Button>
      )}
    </div>
  );
}

function getSessionStateMeta(state: SessionState) {
  switch (state) {
    case "active":
      return {
        label: "Current session",
        className:
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      };

    case "valid":
      return {
        label: "Active",
        className: "border-border bg-muted/50 text-muted-foreground",
      };

    case "expiring_soon":
      return {
        label: "Expiring soon",
        className:
          "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
      };

    case "expired":
      return {
        label: "Expired",
        className:
          "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400",
      };

    default:
      return {
        label: "Unknown",
        className: "border-border bg-muted/50 text-muted-foreground",
      };
  }
}
