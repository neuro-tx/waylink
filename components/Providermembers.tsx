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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Crown,
  Loader2,
  MoreVertical,
  Shield,
  UserCog,
  UserMinus,
  Users,
} from "lucide-react";
import { MembersRoles, ProviderMemebers } from "@/lib/admin-types";
import { initials } from "@/lib/helpers";
import { fmtDate } from "@/lib/utils";

const ROLE_CFG: Record<
  MembersRoles,
  {
    label: string;
    icon: React.ReactNode;
    badge: string;
    row: string;
  }
> = {
  owner: {
    label: "Owner",
    icon: <Crown className="h-3 w-3" />,
    badge:
      "border-amber-500/30  bg-amber-500/8  text-amber-400  hover:bg-amber-500/8",
    row: "border-amber-500/10",
  },
  manager: {
    label: "Manager",
    icon: <Shield className="h-3 w-3" />,
    badge:
      "border-blue-500/30   bg-blue-500/8   text-blue-400   hover:bg-blue-500/8",
    row: "border-border/60",
  },
  staff: {
    label: "Staff",
    icon: <UserCog className="h-3 w-3" />,
    badge:
      "border-zinc-500/30   bg-zinc-500/8   text-zinc-400   hover:bg-zinc-500/8",
    row: "border-border/60",
  },
};

const ROLES: MembersRoles[] = ["owner", "manager", "staff"];
const FILTER_TABS: { key: MembersRoles | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "owner", label: "Owner" },
  { key: "manager", label: "Manager" },
  { key: "staff", label: "Staff" },
];

function Avatar({
  name,
  src,
  size = "md",
}: {
  name: string;
  src: string | null;
  size?: "sm" | "md";
}) {
  const hue = (name.charCodeAt(0) * 37 + (name.charCodeAt(1) ?? 0) * 13) % 360;
  const dim = size === "sm" ? "h-7 w-7 text-[10px]" : "h-9 w-9 text-xs";
  if (src)
    return (
      <img
        src={src}
        alt={name}
        className={`${dim} rounded-lg object-cover shrink-0`}
        loading="lazy"
      />
    );
  return (
    <div
      className={`${dim} rounded-lg flex items-center justify-center font-semibold shrink-0 select-none`}
      style={{
        background: `oklch(28% 0.07 ${hue})`,
        color: `oklch(82% 0.14 ${hue})`,
      }}
    >
      {initials(name)}
    </div>
  );
}

function RemoveDialog({
  member,
  loading,
  onConfirm,
  onCancel,
}: {
  member: ProviderMemebers | null;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Dialog open={!!member} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-sm gap-0 p-0 overflow-hidden">
        <div className="h-0.5 w-full bg-destructive" />
        <div className="p-6 space-y-4">
          <DialogHeader className="space-y-2">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-destructive/10 text-destructive">
              <UserMinus className="h-4 w-4" />
            </div>
            <DialogTitle className="text-base">Remove member?</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              This will remove them from the provider immediately. They'll lose
              access to all provider resources.
            </DialogDescription>
          </DialogHeader>

          {member && (
            <div className="flex items-center gap-2.5 rounded-lg border bg-muted/40 px-3 py-2.5">
              <Avatar name={member.name} src={member.avatar} size="sm" />
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{member.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {member.email}
                </p>
              </div>
              <Badge
                variant="outline"
                className={`ml-auto text-[10px] shrink-0 ${ROLE_CFG[member.role].badge}`}
              >
                {ROLE_CFG[member.role].label}
              </Badge>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {loading ? "Removing…" : "Remove"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RoleDialog({
  payload,
  loading,
  onConfirm,
  onCancel,
}: {
  payload: { member: ProviderMemebers; newRole: MembersRoles } | null;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!payload) return null;
  const { member, newRole } = payload;
  const cfg = ROLE_CFG[newRole];
  return (
    <Dialog open onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-sm gap-0 p-0 overflow-hidden">
        <div className="h-0.5 w-full bg-blue-500" />
        <div className="p-6 space-y-4">
          <DialogHeader className="space-y-2">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-500/10 text-blue-400">
              <UserCog className="h-4 w-4" />
            </div>
            <DialogTitle className="text-base">
              Change role to {cfg.label}?
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              {member.name}'s permissions will update immediately across the
              provider.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2.5">
            <Avatar name={member.name} src={member.avatar} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium truncate">{member.name}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge
                variant="outline"
                className={`text-[10px] ${ROLE_CFG[member.role].badge}`}
              >
                {ROLE_CFG[member.role].label}
              </Badge>
              <span className="text-[10px] text-muted-foreground">→</span>
              <Badge variant="outline" className={`text-[10px] ${cfg.badge}`}>
                {cfg.label}
              </Badge>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={onConfirm} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              {loading ? "Updating…" : "Confirm"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const MemberRow = ({
  member,
  onRemove,
  onRoleChange,
  loadingId,
}: {
  member: ProviderMemebers;
  onRemove: (m: ProviderMemebers) => void;
  onRoleChange: (m: ProviderMemebers, r: MembersRoles) => void;
  loadingId: string | null;
}) => {
  const cfg = ROLE_CFG[member.role];
  const isOwner = member.role === "owner";
  const isLoading = loadingId === member.userId;

  return (
    <div
      className={`group flex items-center gap-2 rounded-lg border p-3 transition-colors ${
        isLoading ? "opacity-50 pointer-events-none" : "hover:bg-muted/20"
      } ${cfg.row}`}
    >
      <Avatar name={member.name} src={member.avatar} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium truncate">{member.name}</p>
          {isOwner && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Crown className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                </TooltipTrigger>
                <TooltipContent>Provider owner</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{member.email}</p>
      </div>

      <Badge
        variant="outline"
        className={`gap-1.5 text-[11px] font-medium shrink-0 hidden sm:flex ${cfg.badge}`}
      >
        {cfg.icon}
        {cfg.label}
      </Badge>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <p className="text-[11px] text-muted-foreground shrink-0 hidden md:block tabular-nums">
              {fmtDate(member.createdAt)}
            </p>
          </TooltipTrigger>
          <TooltipContent>Joined {fmtDate(member.createdAt)}</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="w-7 flex items-center justify-center shrink-0">
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-45">
              <div className="p-1">
                <p className="text-sm tracking-wider text-muted-foreground font-medium mb-1">
                  Change Role
                </p>
                {ROLES.filter((r) => r !== member.role).map((r) => {
                  const rc = ROLE_CFG[r];
                  return (
                    <DropdownMenuItem
                      key={r}
                      onSelect={() => onRoleChange(member, r)}
                      className="text-xs gap-2 rounded-sm"
                    >
                      {rc.icon}
                      {rc.label}
                    </DropdownMenuItem>
                  );
                })}
              </div>

              {!isOwner && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => onRemove(member)}
                    className="text-destructive focus:text-destructive bg-destructive/5 focus:bg-destructive/10 dark:bg-destructive/10 dark:focus:bg-destructive/20"
                  >
                    <UserMinus className="h-3.5 w-3.5 text-destructive" />
                    Remove member
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};

interface Props {
  members: ProviderMemebers[];
  onRemoveMember?: (userId: string) => Promise<void>;
  onChangeRole?: (userId: string, role: MembersRoles) => Promise<void>;
}

export function ProviderMembers({
  members: initial,
  onRemoveMember,
  onChangeRole,
}: Props) {
  const [members, setMembers] = useState<ProviderMemebers[]>(initial);
  const [activeTab, setActiveTab] = useState<MembersRoles | "all">("all");
  const [removeTarget, setRemoveTarget] = useState<ProviderMemebers | null>(
    null,
  );
  const [rolePayload, setRolePayload] = useState<{
    member: ProviderMemebers;
    newRole: MembersRoles;
  } | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Counts
  const counts = useMemo(() => {
    const m: Record<string, number> = { all: members.length };
    for (const mb of members) m[mb.role] = (m[mb.role] ?? 0) + 1;
    return m;
  }, [members]);

  const filtered = useMemo(
    () =>
      activeTab === "all"
        ? members
        : members.filter((m) => m.role === activeTab),
    [members, activeTab],
  );

  // Remove
  const handleRemove = useCallback(async () => {
    if (!removeTarget) return;
    setLoadingId(removeTarget.userId);
    try {
      await (onRemoveMember
        ? onRemoveMember(removeTarget.userId)
        : new Promise<void>((r) => setTimeout(r, 800)));
      setMembers((prev) =>
        prev.filter((m) => m.userId !== removeTarget.userId),
      );
      setRemoveTarget(null);
    } finally {
      setLoadingId(null);
    }
  }, [removeTarget, onRemoveMember]);

  // Role change
  const handleRoleChange = useCallback(async () => {
    if (!rolePayload) return;
    const { member, newRole } = rolePayload;
    setLoadingId(member.userId);
    try {
      await (onChangeRole
        ? onChangeRole(member.userId, newRole)
        : new Promise<void>((r) => setTimeout(r, 800)));
      setMembers((prev) =>
        prev.map((m) =>
          m.userId === member.userId
            ? { ...m, role: newRole, updatedAt: new Date() }
            : m,
        ),
      );
      setRolePayload(null);
    } finally {
      setLoadingId(null);
    }
  }, [rolePayload, onChangeRole]);

  return (
    <div className="rounded-md border bg-card overflow-hidden">
      <div className="flex items-center justify-between gap-3 p-4 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-muted/60">
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Team Members</h3>
            <p className="text-xs text-muted-foreground">
              {members.length} member{members.length !== 1 ? "s" : ""} ·{" "}
              {counts["manager"] ?? 0} manager
              {(counts["manager"] ?? 0) !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {(["owner", "manager", "staff"] as MembersRoles[]).map((r) => {
            const c = counts[r] ?? 0;
            if (!c) return null;
            return (
              <span
                key={r}
                className={`hidden sm:flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md border ${ROLE_CFG[r].badge}`}
              >
                {ROLE_CFG[r].icon}
                {c}
              </span>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-0.5 px-4 py-2.5 border-b border-border/40">
        {FILTER_TABS.map(({ key, label }) => {
          const count = counts[key] ?? 0;
          const active = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                active
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {label}
              {count > 0 && (
                <span
                  className={`text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-4.5 text-center leading-none ${
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

      <div className="p-4 space-y-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <div className="p-3 rounded-xl bg-muted/40">
              <Users className="h-5 w-5 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              No {activeTab === "all" ? "" : activeTab + " "}members
            </p>
          </div>
        ) : (
          filtered.map((m) => (
            <MemberRow
              key={m.userId}
              member={m}
              onRemove={setRemoveTarget}
              onRoleChange={(member, newRole) =>
                setRolePayload({ member, newRole })
              }
              loadingId={loadingId}
            />
          ))
        )}
      </div>

      <RemoveDialog
        member={removeTarget}
        loading={loadingId === removeTarget?.userId}
        onConfirm={handleRemove}
        onCancel={() => setRemoveTarget(null)}
      />
      <RoleDialog
        payload={rolePayload}
        loading={loadingId === rolePayload?.member.userId}
        onConfirm={handleRoleChange}
        onCancel={() => setRolePayload(null)}
      />
    </div>
  );
}
