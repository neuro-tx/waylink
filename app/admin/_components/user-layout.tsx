"use client";

import { memo } from "react";
import {
  Ban,
  Crown,
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
  TriangleAlert,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import ThumbnailImage from "@/components/ThumbnailImage";
import { Button } from "@/components/ui/button";
import { Pagination, User } from "@/lib/all-types";
import { Skeleton } from "@/components/ui/skeleton";
import { UserRole } from "@/lib/admin-types";

export type PageStatus = "loading" | "success" | "error";
export type TableStatus = "idle" | "loading" | "success" | "empty" | "error";

interface UsersTableProps {
  users: User[];
  onChangeRole: (user: User) => void;
  onBan: (user: User) => void;
  onUnbanned: (userId: string) => void;
  onDelete: (user: User) => void;
  status: TableStatus;
}

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

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  provider: "Provider",
  user: "Normal User",
};

export const ROLE_OPTIONS: {
  value: UserRole;
  label: string;
  description: string;
}[] = [
  {
    value: "admin",
    label: "Admin",
    description: "Full access to every admin tool, plan, and setting.",
  },
  {
    value: "provider",
    label: "Provider",
    description: "Manages their organization's staff, listings, and bookings.",
  },
  {
    value: "user",
    label: "User",
    description: "Standard customer-facing account with no admin access.",
  },
];

export function UsersTableView({
  users,
  onChangeRole,
  onBan,
  onUnbanned,
  onDelete,
  status,
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
          {status === "loading" ? (
            Array.from({ length: 6 }).map((_, index) => (
              <UserRowSkeleton key={index} />
            ))
          ) : status === "error" ? (
            <TableRow>
              <TableCell colSpan={7} className="h-64">
                <div className="flex flex-col items-center justify-center gap-3 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                    <TriangleAlert className="size-6 text-destructive" />
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-semibold">
                      Failed to load users
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Something went wrong. Please try again.
                    </p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : status === "empty" ? (
            <TableRow>
              <TableCell colSpan={7} className="h-64">
                <div className="flex flex-col items-center justify-center gap-3 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Users className="size-6 text-muted-foreground" />
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-semibold">No users found</p>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your search or filters.
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

export const UserRow = memo(function UserRow({
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

export function UserRowActions({
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
            className="text-rose-500 focus:text-rose-500"
          >
            <ShieldBan className="h-4 w-4 text-rose-500" />
            Ban user
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() => onDelete(user)}
          className="text-rose-500 focus:text-rose-500"
        >
          <Trash2 className="h-4 w-4 text-rose-500" />
          Delete user
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function UserStatCard({
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

export function UsersDataPagination({
  pagination,
  onPageChange,
  isLoading = false,
}: {
  pagination: Pagination | null;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}) {
  if (!pagination) return;

  const { page, totalPages, total, limit, hasNextPage, hasPrevPage } =
    pagination;

  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium">{start}</span>–
        <span className="font-medium">{end}</span> of{" "}
        <span className="font-medium">{total}</span> users
      </p>

      <div className="flex items-center gap-2">
        <Button
          size="icon"
          variant="outline"
          disabled={!hasPrevPage || isLoading}
          onClick={() => onPageChange(1)}
        >
          <ChevronsLeft className="size-4" />
        </Button>

        <Button
          size="icon"
          variant="outline"
          disabled={!hasPrevPage || isLoading}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="size-4" />
        </Button>

        <div className="min-w-24 text-center text-sm font-medium">
          Page {page} of {totalPages}
        </div>

        <Button
          size="icon"
          variant="outline"
          disabled={!hasNextPage || isLoading}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="size-4" />
        </Button>

        <Button
          size="icon"
          variant="outline"
          disabled={!hasNextPage || isLoading}
          onClick={() => onPageChange(totalPages)}
        >
          <ChevronsRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function UserRowSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />

          <div className="min-w-0 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="h-6 w-24 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-6 w-20 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-6 w-20 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell className="text-right">
        <Skeleton className="ml-auto size-8 rounded-md" />
      </TableCell>
    </TableRow>
  );
}

function UserStatCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="size-4 rounded" />
      </div>

      <Skeleton className="mt-3 h-8 w-16" />
    </div>
  );
}

function UsersTableSkeleton() {
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
          {Array.from({ length: 8 }).map((_, index) => (
            <UserRowSkeleton key={index} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function UsersPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <UserStatCardSkeleton key={index} />
        ))}
      </div>

      <UsersTableSkeleton />

      <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-4 w-48" />

        <div className="flex items-center gap-2">
          <Skeleton className="size-9 rounded-md" />
          <Skeleton className="size-9 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="size-9 rounded-md" />
          <Skeleton className="size-9 rounded-md" />
        </div>
      </div>
    </div>
  );
}
