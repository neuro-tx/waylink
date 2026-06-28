"use client";

import { useState, useMemo, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  ShieldAlert,
  TimerOff,
  UserCheck,
  UserCog,
  Users,
  XCircle,
} from "lucide-react";
import { Invites, InviteStatus, MembersRoles } from "@/lib/admin-types";
import { fmtDate, timeAgo } from "@/lib/utils";

const MOCK: Invites[] = [
  {
    id: "inv-1",
    providerId: "p1",
    message: "Hey! Join our team as a tour manager.",
    role: "manager",
    token: "tok_abc123",
    status: "pending",
    senderId: "u1",
    receiverId: "u10",
    acceptedAt: null,
    expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date("2024-11-20"),
    updatedAt: new Date("2024-11-20"),
  },
  {
    id: "inv-2",
    providerId: "p1",
    message: null,
    role: "staff",
    token: "tok_def456",
    status: "accepted",
    senderId: "u1",
    receiverId: "u11",
    acceptedAt: new Date("2024-11-15"),
    expiresAt: new Date("2024-11-18"),
    createdAt: new Date("2024-11-11"),
    updatedAt: new Date("2024-11-15"),
  },
  {
    id: "inv-3",
    providerId: "p1",
    message: "We need a senior guide for the Sinai routes.",
    role: "staff",
    token: "tok_ghi789",
    status: "expired",
    senderId: "u2",
    receiverId: "u12",
    acceptedAt: null,
    expiresAt: new Date("2024-11-10"),
    createdAt: new Date("2024-11-03"),
    updatedAt: new Date("2024-11-10"),
  },
  {
    id: "inv-4",
    providerId: "p1",
    message: "Please join as manager to handle bookings.",
    role: "manager",
    token: "tok_jkl012",
    status: "cancelled",
    senderId: "u1",
    receiverId: "u13",
    acceptedAt: null,
    expiresAt: new Date("2024-11-25"),
    createdAt: new Date("2024-11-18"),
    updatedAt: new Date("2024-11-19"),
  },
  {
    id: "inv-5",
    providerId: "p1",
    message: null,
    role: "staff",
    token: "tok_mno345",
    status: "pending",
    senderId: "u2",
    receiverId: "u14",
    acceptedAt: null,
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    createdAt: new Date("2024-11-21"),
    updatedAt: new Date("2024-11-21"),
  },
];

const STATUS_CFG: Record<
  InviteStatus,
  {
    label: string;
    icon: React.ReactNode;
    className: string;
    dot: string;
  }
> = {
  pending: {
    label: "Pending",
    icon: <Clock className="h-3 w-3" />,
    className:
      "border-amber-500/30   bg-amber-500/8   text-amber-400  hover:bg-amber-500/8",
    dot: "#f59e0b",
  },
  accepted: {
    label: "Accepted",
    icon: <CheckCircle2 className="h-3 w-3" />,
    className:
      "border-emerald-500/30 bg-emerald-500/8 text-emerald-400 hover:bg-emerald-500/8",
    dot: "#22c55e",
  },
  expired: {
    label: "Expired",
    icon: <TimerOff className="h-3 w-3" />,
    className:
      "border-zinc-500/30   bg-zinc-500/8   text-zinc-500   hover:bg-zinc-500/8",
    dot: "#52525b",
  },
  cancelled: {
    label: "Cancelled",
    icon: <XCircle className="h-3 w-3" />,
    className:
      "border-red-500/30    bg-red-500/8    text-red-400    hover:bg-red-500/8",
    dot: "#ef4444",
  },
};

const ROLE_CFG: Record<
  NonNullable<MembersRoles>,
  {
    label: string;
    icon: React.ReactNode;
    className: string;
  }
> = {
  owner: {
    label: "Owner",
    icon: <ShieldAlert className="h-3 w-3" />,
    className:
      "border-purple-500/30 bg-purple-500/8 text-purple-400 hover:bg-purple-500/8",
  },
  manager: {
    label: "Manager",
    icon: <UserCog className="h-3 w-3" />,
    className:
      "border-blue-500/30   bg-blue-500/8   text-blue-400   hover:bg-blue-500/8",
  },
  staff: {
    label: "Staff",
    icon: <Users className="h-3 w-3" />,
    className:
      "border-zinc-500/30   bg-zinc-500/8   text-zinc-400   hover:bg-zinc-500/8",
  },
};

const FILTER_TABS: { key: InviteStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "accepted", label: "Accepted" },
  { key: "expired", label: "Expired" },
  { key: "cancelled", label: "Cancelled" },
];

function isExpiringSoon(d: Date) {
  return (
    d.getTime() - Date.now() < 24 * 3600 * 1000 && d.getTime() > Date.now()
  );
}

function maskToken(token: string) {
  return token.slice(0, 8) + "••••••••";
}

function RevokeDialog({
  invite,
  loading,
  onConfirm,
  onCancel,
}: {
  invite: Invites | null;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Dialog open={!!invite} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-sm gap-0 p-0 overflow-hidden">
        <div className="h-0.5 w-full bg-red-500" />
        <div className="p-6 space-y-4">
          <DialogHeader className="space-y-2">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-red-500/10 text-red-400">
              <XCircle className="h-4 w-4" />
            </div>
            <DialogTitle className="text-base">Cancel this invite?</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              The invite token will be invalidated. The recipient won't be able
              to accept it.
            </DialogDescription>
          </DialogHeader>

          {invite && (
            <div className="rounded-lg border bg-muted/40 px-3 py-2.5 space-y-1">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs font-mono text-muted-foreground">
                  {invite.receiverId}
                </span>
              </div>
              {invite.role && (
                <div className="flex items-center gap-2">
                  {ROLE_CFG[invite.role].icon}
                  <span className="text-xs text-muted-foreground capitalize">
                    {invite.role}
                  </span>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="flex-1"
            >
              Keep invite
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={loading}
              className="flex-1"
            >
              {loading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              {loading ? "Cancelling…" : "Cancel invite"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const InviteRow = ({
  invite,
  onRevoke,
  loadingId,
  hideAction,
}: {
  invite: Invites;
  onRevoke: (inv: Invites) => void;
  loadingId: string | null;
  hideAction?: boolean;
}) => {
  const statusCfg = STATUS_CFG[invite.status];
  const roleCfg = invite.role ? ROLE_CFG[invite.role] : null;
  const isPending = invite.status === "pending";
  const expiringSoon = isPending && isExpiringSoon(invite.expiresAt);
  const isLoading = loadingId === invite.id;

  return (
    <div
      className={`group relative flex items-start gap-3 rounded-xl border px-4 py-3.5 transition-colors ${
        isLoading ? "opacity-50 pointer-events-none" : "hover:bg-muted/20"
      } ${
        expiringSoon
          ? "border-amber-500/20 bg-amber-500/3"
          : "border-border/60 bg-transparent"
      }`}
    >
      {/* Status dot */}
      <div className="mt-0.5 shrink-0">
        <span
          className="flex h-2 w-2 rounded-full mt-1"
          style={{
            background: statusCfg.dot,
            boxShadow: isPending ? `0 0 6px ${statusCfg.dot}` : "none",
          }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Top row */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className={`gap-1.5 text-[11px] font-medium ${statusCfg.className}`}
          >
            {statusCfg.icon}
            {statusCfg.label}
          </Badge>

          {roleCfg && (
            <Badge
              variant="outline"
              className={`gap-1.5 text-[11px] font-medium ${roleCfg.className}`}
            >
              {roleCfg.icon}
              {roleCfg.label}
            </Badge>
          )}

          {expiringSoon && (
            <span className="text-[10px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-md">
              ⚡ {timeAgo(invite.expiresAt)}
            </span>
          )}
        </div>

        {/* IDs row */}
        <div className="flex items-center gap-3 flex-wrap text-[11px] text-muted-foreground">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex items-center gap-1 font-mono cursor-default">
                  <Mail className="h-3 w-3" />
                  {invite.receiverId}
                </span>
              </TooltipTrigger>
              <TooltipContent>Receiver ID</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <span className="text-muted-foreground/30">·</span>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="font-mono cursor-default">
                  {maskToken(invite.token)}
                </span>
              </TooltipTrigger>
              <TooltipContent>Invite token (masked)</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {invite.message && (
          <p className="text-xs text-muted-foreground leading-relaxed italic border-l-2 border-muted pl-2.5">
            "{invite.message}"
          </p>
        )}

        {/* Timestamps */}
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground/50 flex-wrap">
          <span>Sent {fmtDate(invite.createdAt)}</span>

          {invite.status === "pending" && (
            <>
              <span>·</span>
              <span className={expiringSoon ? "text-amber-400/70" : ""}>
                Expires {fmtDate(invite.expiresAt)}
              </span>
            </>
          )}

          {invite.status === "accepted" && invite.acceptedAt && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1 text-emerald-400/60">
                <UserCheck className="h-3 w-3" />
                Accepted {fmtDate(invite.acceptedAt)}
              </span>
            </>
          )}

          {invite.status === "expired" && (
            <>
              <span>·</span>
              <span>Expired {fmtDate(invite.expiresAt)}</span>
            </>
          )}
        </div>
      </div>

      {!hideAction && isPending && (
        <div className="shrink-0">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRevoke(invite)}
              className="h-7 gap-1.5 text-destructive hover:text-destructive"
            >
              <XCircle className="h-3.5 w-3.5" />
              Cancel Invite
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

interface Props {
  invites?: Invites[];
  onCancelInvite?: (id: string) => Promise<void>;
  hideAction?: boolean;
}

export function ProviderInvites({
  invites: initialInvites = MOCK,
  onCancelInvite,
  hideAction = false,
}: Props) {
  const [invites, setInvites] = useState<Invites[]>(initialInvites);
  const [activeTab, setActiveTab] = useState<InviteStatus | "all">("all");
  const [revokeTarget, setRevokeTarget] = useState<Invites | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Tab counts
  const counts = useMemo(() => {
    const m: Record<string, number> = { all: invites.length };
    for (const inv of invites) m[inv.status] = (m[inv.status] ?? 0) + 1;
    return m;
  }, [invites]);

  const filtered = useMemo(
    () =>
      activeTab === "all"
        ? invites
        : invites.filter((i) => i.status === activeTab),
    [invites, activeTab],
  );

  const pendingCount = counts["pending"] ?? 0;

  const handleRevoke = useCallback(async () => {
    if (!revokeTarget) return;
    setLoadingId(revokeTarget.id);
    try {
      await (onCancelInvite
        ? onCancelInvite(revokeTarget.id)
        : new Promise<void>((r) => setTimeout(r, 900)));

      setInvites((prev) =>
        prev.map((i) =>
          i.id === revokeTarget.id
            ? { ...i, status: "cancelled", updatedAt: new Date() }
            : i,
        ),
      );
      setRevokeTarget(null);
    } finally {
      setLoadingId(null);
    }
  }, [revokeTarget, onCancelInvite]);

  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-4 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-muted/60">
            <Mail className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Team Invites</h3>
            <p className="text-xs text-muted-foreground">
              {invites.length} total · {pendingCount} pending
            </p>
          </div>
        </div>

        {pendingCount > 0 && (
          <Badge
            variant="outline"
            className="gap-1.5 text-[11px] border-amber-500/30 bg-amber-500/8 text-amber-400"
          >
            <Clock className="h-3 w-3" />
            {pendingCount} awaiting
          </Badge>
        )}
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex items-center gap-0.5 px-5 py-2.5 border-b border-border/40 overflow-x-auto">
        {FILTER_TABS.map(({ key, label }) => {
          const count = counts[key] ?? 0;
          const active = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                active
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {label}
              {count > 0 && (
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-4.5 text-center leading-none ${
                    active
                      ? "bg-background text-foreground"
                      : "bg-muted/60 text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── List ── */}
      <div className="p-4 space-y-2.5">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <div className="p-3 rounded-xl bg-muted/40">
              <Mail className="h-5 w-5 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              No {activeTab === "all" ? "" : activeTab + " "}invites
            </p>
            <p className="text-xs text-muted-foreground/50">
              {activeTab === "pending"
                ? "All invites have been resolved."
                : "Nothing to show here."}
            </p>
          </div>
        ) : (
          filtered.map((invite) => (
            <InviteRow
              key={invite.id}
              invite={invite}
              onRevoke={setRevokeTarget}
              loadingId={loadingId}
              hideAction={hideAction}
            />
          ))
        )}
      </div>

      {!hideAction && (
        <RevokeDialog
          invite={revokeTarget}
          loading={loadingId === revokeTarget?.id}
          onConfirm={handleRevoke}
          onCancel={() => setRevokeTarget(null)}
        />
      )}
    </div>
  );
}
