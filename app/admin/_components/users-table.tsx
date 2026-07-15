"use client";

import { memo, useMemo, useState, useTransition } from "react";
import {
  Ban,
  Crown,
  Search,
  Shield,
  Users as UsersIcon,
  UserCheck,
  Loader2,
  MoreVertical,
  ShieldCheck,
  ShieldBan,
  Trash2,
  BadgeCheck,
  AlertCircle,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn, timeAgo } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROLE_LABELS, UserStatsData, type UserRole } from "@/lib/admin-types";
import ThumbnailImage from "@/components/ThumbnailImage";
import {
  BanUserDialog,
  ChangeRoleDialog,
  DeleteUserDialog,
} from "./UserDialogs";
import { Button } from "@/components/ui/button";
import { User } from "@/lib/all-types";
import { unbanUser } from "@/actions/user.actions";
import { toast } from "sonner";

interface UserRowActionsProps {
  user: User;
  onChangeRole: (user: User) => void;
  onBan: (user: User) => void;
  onUnbanned: (userId: string) => void;
  onDelete: (user: User) => void;
  pending?: boolean;
}

const ROLE_BADGE: Record<UserRole, { icon: typeof Crown; className: string }> =
  {
    admin: {
      icon: Crown,
      className: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    },
    provider: {
      icon: Shield,
      className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    user: { icon: UsersIcon, className: "bg-muted text-muted-foreground" },
  };

interface UsersTableProps {
  users: User[];
  onChangeRole: (user: User) => void;
  onBan: (user: User) => void;
  onUnbanned: (userId: string) => void;
  onDelete: (user: User) => void;
}

function UsersTableView({
  users,
  onChangeRole,
  onBan,
  onUnbanned,
  onDelete,
}: UsersTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-87">User</TableHead>
            <TableHead>Email verified</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Last update</TableHead>
            <TableHead className="w-13" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-64">
                <div className="flex flex-col items-center justify-center gap-3 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Users className="h-6 w-6 text-muted-foreground" />
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-semibold">No users found</p>
                    <p className="text-sm text-muted-foreground">
                      There are no users to display. Try adjusting your search
                      or try again later.
                    </p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                onChangeRole={onChangeRole}
                onBan={onBan}
                onUnbanned={onUnbanned}
                onDelete={onDelete}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [banTarget, setBanTarget] = useState<User | null>(null);
  const [roleTarget, setRoleTarget] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [isPending, startTransition] = useTransition();
  const [stats, setstats] = useState<UserStatsData | null>(null);

  function handleBanned(userId: string) {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, banned: true, sessions: 0 } : u,
      ),
    );
  }

  function handleUnbanned(userId: string) {
    startTransition(async () => {
      const res = await unbanUser(userId);
      if (!res.success) {
        toast.error(res.error);
        return;
      }

      toast.success("User unbaned successfully");
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, banned: false, banReason: null, banExpires: null }
            : u,
        ),
      );
    });
  }

  function handleRoleChanged(userId: string, role: UserRole) {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
  }

  function handleDeleted(userId: string) {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  }

  return (
    <div className="space-y-5">
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Total users"
            value={stats?.total}
            icon={UsersIcon}
            className="text-violet-600 dark:text-violet-400"
          />
          <StatCard
            label="Active"
            value={stats?.activeCount}
            icon={UserCheck}
            className="text-emerald-600 dark:text-emerald-400"
          />
          <StatCard
            label="Banned"
            value={stats?.bannedCount}
            icon={Ban}
            className="text-rose-600 dark:text-rose-400"
          />
          <StatCard
            label="Admins"
            value={stats?.admins}
            icon={Crown}
            className="text-amber-600 dark:text-amber-400"
          />
        </div>
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="pl-9 w-full md:max-w-lg"
        />
      </div>

      {isPending && (
        <div className="py-3 px-4 rounded-lg border border-amber-500/50 bg-amber-500/10">
          <div className="flex items-center gap-3 justify-between">
            <div className="">
              <p className="text-base text-amber-500 font-medium font-mono">
                Unban Process
              </p>
              <p className="mt-1 text-muted-foreground text-xs">
                Restore this user access to the platform ,the user will be able
                to sign in and use all permitted features again.
              </p>
            </div>

            <Loader2 className="size-4.5 animate-spin text-amber-500" />
          </div>
        </div>
      )}

      <div className={cn(isPending && "opacity-50 pointer-events-none")}>
        <UsersTableView
          users={users}
          onChangeRole={setRoleTarget}
          onBan={setBanTarget}
          onUnbanned={handleUnbanned}
          onDelete={setDeleteTarget}
        />
      </div>

      <BanUserDialog
        user={banTarget}
        open={!!banTarget}
        onOpenChange={(open) => !open && setBanTarget(null)}
        onBanned={handleBanned}
      />
      <ChangeRoleDialog
        user={roleTarget}
        open={!!roleTarget}
        onOpenChange={(open) => !open && setRoleTarget(null)}
        onRoleChanged={handleRoleChanged}
      />
      <DeleteUserDialog
        user={deleteTarget}
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onDeleted={handleDeleted}
      />
    </div>
  );
}

const UserRow = memo(function UserRow({
  user,
  onChangeRole,
  onBan,
  onUnbanned,
  onDelete,
}: {
  user: User;
  onChangeRole: (user: User) => void;
  onBan: (user: User) => void;
  onUnbanned: (userId: string) => void;
  onDelete: (user: User) => void;
}) {
  const roleBadge = ROLE_BADGE[user.role];
  const RoleIcon = roleBadge.icon;

  return (
    <TableRow className="hover:bg-muted/40">
      <TableCell>
        <div className="flex items-center gap-3">
          <ThumbnailImage
            alternative={user.name}
            src={user.image}
            className="rounded-full"
          />

          <div className="min-w-0">
            <p className="truncate font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
      </TableCell>

      <TableCell>
        {user.emailVerified ? (
          <Badge className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
            <BadgeCheck className="size-3" />
            Verified
          </Badge>
        ) : (
          <Badge className="gap-1 border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400">
            <AlertCircle className="size-3" />
            Unverified
          </Badge>
        )}
      </TableCell>

      <TableCell>
        <Badge
          variant="secondary"
          className={cn("gap-1 font-medium", roleBadge.className)}
        >
          <RoleIcon className="size-3" />
          {ROLE_LABELS[user.role]}
        </Badge>
      </TableCell>

      <TableCell>
        {user.banned ? (
          <Badge
            variant="secondary"
            className="gap-1 bg-rose-500/10 font-medium text-rose-600 dark:text-rose-400"
          >
            <Ban className="size-3" />
            Banned
          </Badge>
        ) : (
          <Badge
            variant="secondary"
            className="gap-1 bg-emerald-500/10 font-medium text-emerald-600 dark:text-emerald-400"
          >
            <UserCheck className="size-3" />
            Active
          </Badge>
        )}
      </TableCell>

      <TableCell className="text-muted-foreground">
        {timeAgo(user.createdAt)}
      </TableCell>

      <TableCell className="text-muted-foreground">
        {timeAgo(user.updatedAt)}
      </TableCell>

      <TableCell className="text-right">
        <UserRowActions
          user={user}
          onChangeRole={onChangeRole}
          onBan={onBan}
          onUnbanned={onUnbanned}
          onDelete={onDelete}
        />
      </TableCell>
    </TableRow>
  );
});

function StatCard({
  label,
  value,
  icon: Icon,
  className,
}: {
  label: string;
  value: number;
  icon: typeof UsersIcon;
  className?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
        <Icon className={cn("h-4 w-4", className)} />
      </div>
      <div className="mt-2 text-2xl font-bold tracking-tight">{value}</div>
    </div>
  );
}

function UserRowActions({
  user,
  onChangeRole,
  onBan,
  onUnbanned,
  onDelete,
  pending,
}: UserRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled={pending}
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MoreVertical className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={() => onChangeRole(user)}>
          <ShieldCheck className="h-4 w-4" />
          Change role
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {user.banned ? (
          <DropdownMenuItem
            onClick={() => onUnbanned(user.id)}
            className="text-emerald-500"
          >
            <UserCheck className="h-4 w-4 text-emerald-600" />
            Remove ban
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => onBan(user)}
            className="text-rose-500"
          >
            <ShieldBan className="h-4 w-4 text-rose-500" />
            Ban user
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() => onDelete(user)}
          className="text-rose-500"
        >
          <Trash2 className="h-4 w-4 text-rose-500" />
          Delete user
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
