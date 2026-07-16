"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  Ban,
  Crown,
  Search,
  Users as UsersIcon,
  UserCheck,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { UserStatsData, type UserRole } from "@/lib/admin-types";
import {
  BanUserDialog,
  ChangeRoleDialog,
  DeleteUserDialog,
} from "./UserDialogs";
import { Pagination, User } from "@/lib/all-types";
import { getAllUsers, unbanUser, userAnalysis } from "@/actions/user.actions";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import { ErrorState } from "./ErrorState";
import {
  PageStatus,
  TableStatus,
  UsersDataPagination,
  UsersPageSkeleton,
  UsersTableView,
  UserStatCard,
} from "./user-layout";

export function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [banTarget, setBanTarget] = useState<User | null>(null);
  const [roleTarget, setRoleTarget] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [isPending, startTransition] = useTransition();
  const [stats, setStats] = useState<UserStatsData | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [pageStatus, setPageStatus] = useState<PageStatus>("loading");
  const [usersTable, setUsersTable] = useState<TableStatus>("loading");
  const firstRender = useRef<boolean>(true);
  const debouncedSearch = useDebounce(search);
  const [retryKey, setRetryKey] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setPageStatus("loading");
      const [userRes, statsRes] = await Promise.all([
        getAllUsers(),
        userAnalysis(),
      ]);

      if (!userRes.success || !statsRes.success) {
        setPageStatus("error");
        return;
      }

      const mainUsers = userRes.data?.users as User[];
      const mainPagination = userRes.data?.pagination ?? null;
      const mainStats = statsRes?.data;

      setStats(mainStats);
      setUsers(mainUsers);
      setPagination(mainPagination);
      setUsersTable(mainUsers.length ? "success" : "empty");

      setPageStatus("success");
      firstRender.current = false;
    }

    load();

    return () => {
      mounted = false;
    };
  }, [retryKey]);

  useEffect(() => {
    if (firstRender.current) return;

    async function search() {
      setUsersTable("loading");
      const result = await getAllUsers(debouncedSearch, page);
      if (!result.success) {
        setUsersTable("error");
        return;
      }

      const mainUsers = result.data?.users as User[];
      const mainPagination = result.data?.pagination ?? null;

      setUsers(mainUsers);
      setPagination(mainPagination);
      setUsersTable(!mainUsers.length ? "empty" : "success");
    }

    search();
  }, [debouncedSearch, page]);

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

  if (pageStatus === "loading") return <UsersPageSkeleton />;

  if (pageStatus === "error")
    return <ErrorState onRetry={() => setRetryKey((k) => k + 1)} />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage accounts, roles, and access across Way Link.
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <UserStatCard
            label="Total users"
            value={stats?.total}
            icon={UsersIcon}
            className="text-violet-600 dark:text-violet-400"
          />
          <UserStatCard
            label="Active"
            value={stats?.activeCount}
            icon={UserCheck}
            className="text-emerald-600 dark:text-emerald-400"
          />
          <UserStatCard
            label="Banned"
            value={stats?.bannedCount}
            icon={Ban}
            className="text-rose-600 dark:text-rose-400"
          />
          <UserStatCard
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

      <div
        className={cn(
          "space-y-5",
          isPending && "opacity-50 pointer-events-none",
        )}
      >
        <UsersTableView
          users={users}
          onChangeRole={setRoleTarget}
          onBan={setBanTarget}
          onUnbanned={handleUnbanned}
          onDelete={setDeleteTarget}
          status={usersTable}
        />

        <UsersDataPagination
          pagination={pagination}
          onPageChange={setPage}
          isLoading={usersTable === "loading"}
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
