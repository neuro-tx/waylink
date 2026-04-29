"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Ban,
  CheckCircle2,
  CircleDot,
  PackageSearch,
  Users,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtDate } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import type {
  BookingStats,
  BookingSortOption,
  BookingsApiResponse,
  ProviderBookingShape,
} from "@/lib/panel-types";
import { fmtCurrency, initials } from "@/lib/helpers";
import { BookingStatus, Pagination } from "@/lib/all-types";
import { BookingsControls, BookingsStatsBar } from "./BookingsLayout";
import { BookingDrawer } from "./BookingDrawer";

export const statusConfig: Record<
  BookingStatus,
  { label: string; pill: string; icon: React.ElementType }
> = {
  pending: {
    label: "Pending",
    pill: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
    icon: CircleDot,
  },
  confirmed: {
    label: "Confirmed",
    pill: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    icon: CheckCircle2,
  },
  completed: {
    label: "Completed",
    pill: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    pill: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
    icon: Ban,
  },
  expired: {
    label: "Expired",
    pill: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
    icon: XCircle,
  },
};

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell className="py-3">
            <Skeleton className="h-3 w-28" />
          </TableCell>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((j) => (
            <TableCell key={j} className="py-3">
              <Skeleton className="h-3 w-20" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export function BookingsTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const statusFromUrl = (searchParams.get("status") ?? "all") as
    | BookingStatus
    | "all";
  const sortFromUrl = (searchParams.get("sort") ??
    "newest") as BookingSortOption;
  const searchFromUrl = searchParams.get("search") ?? "";
  const pageFromUrl = Number(searchParams.get("page") ?? "1");

  const debouncedSearch = useDebounce(searchFromUrl, 0);

  /* Data state — seeded with server-fetched initial data */
  const [bookings, setBookings] = useState<ProviderBookingShape[]>([]);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [drawerBooking, setDrawerBooking] =
    useState<ProviderBookingShape | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const mainUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const p = new URLSearchParams();
      if (statusFromUrl !== "all") p.set("status", statusFromUrl);
      if (debouncedSearch) p.set("search", debouncedSearch);
      p.set("sort", sortFromUrl);
      p.set("page", String(pageFromUrl));
      p.set("limit", "10");

      const res = await fetch(
        `${mainUrl}/api/provider/panel/bookings?${p.toString()}`,
      );
      if (!res.ok) throw new Error("Failed to load bookings");
      const { data }: { data: BookingsApiResponse } = await res.json();

      setBookings(data.bookings);
      setStats(data.stats);
      setPagination(data.pagination);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [statusFromUrl, debouncedSearch, sortFromUrl, pageFromUrl]);

  /* Page navigation */
  function setPage(v: number) {
    const p = new URLSearchParams(searchParams.toString());
    if (v === 1) p.delete("page");
    else p.set("page", String(v));
    router.push(`${pathname}?${p.toString()}`, { scroll: false });
  }

  function handleOptimisticUpdate(
    bookingId: string,
    patch: Partial<ProviderBookingShape>,
  ) {
    const applyPatch = (b: ProviderBookingShape): ProviderBookingShape => ({
      ...b,
      ...patch,
    });
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? applyPatch(b) : b)),
    );
    setDrawerBooking((prev) =>
      prev?.id === bookingId ? applyPatch(prev) : prev,
    );
  }

  function openDrawer(booking: ProviderBookingShape) {
    setDrawerBooking(booking);
    setDrawerOpen(true);
  }

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return (
    <>
      <BookingsStatsBar stats={stats} />
      <BookingsControls stats={stats} />

      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border">
              <TableHead className="text-xs h-10">Order</TableHead>
              <TableHead className="text-xs h-10">Customer</TableHead>
              <TableHead className="text-xs h-10">Product</TableHead>
              <TableHead className="text-xs h-10">Variant</TableHead>
              <TableHead className="text-xs h-10">Status</TableHead>
              <TableHead className="text-xs h-10">Participants</TableHead>
              <TableHead className="text-xs h-10">Amount</TableHead>
              <TableHead className="text-xs h-10">Date</TableHead>
              <TableHead className="text-xs h-10">Last Update</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableSkeleton />
            ) : error ? (
              <TableRow>
                <TableCell colSpan={9} className="py-16 text-center">
                  <p className="text-sm text-destructive">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={fetchBookings}
                  >
                    Retry
                  </Button>
                </TableCell>
              </TableRow>
            ) : bookings.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="py-16 text-center text-muted-foreground"
                >
                  <PackageSearch
                    size={32}
                    className="mx-auto mb-3 opacity-20"
                  />
                  <p className="text-sm">
                    No bookings match the current filters.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((booking) => {
                const sc = statusConfig[booking.status];
                const StatusIcon = sc.icon;
                return (
                  <TableRow
                    key={booking.id}
                    className="cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => openDrawer(booking)}
                  >
                    <TableCell className="py-3">
                      <span className="text-xs font-mono font-medium text-foreground">
                        #{booking.orderNumber}
                      </span>
                    </TableCell>

                    <TableCell className="py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-7 w-7 shrink-0">
                          <AvatarImage src={booking.user.image ?? undefined} />
                          <AvatarFallback className="text-[10px] font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-100">
                            {initials(booking.user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="">
                          <p className="text-xs font-medium truncate max-w-30 hidden sm:block">
                            {booking.user.name}
                          </p>
                          <p className="font-mono text-[10px] text-muted-foreground">
                            {booking.user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-3">
                      <p className="text-xs truncate max-w-35 hover:bg-muted p-1 rounded-full font-mono">
                        {booking.productTitle}
                      </p>
                    </TableCell>

                    <TableCell className="py-3">
                      <p className="text-xs truncate max-w-30 text-muted-foreground">
                        {booking.variant.name}
                      </p>
                      {booking.variant.startDate && (
                        <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                          {fmtDate(booking.variant.startDate)}
                        </p>
                      )}
                    </TableCell>

                    <TableCell className="py-3">
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 w-fit",
                          sc.pill,
                        )}
                      >
                        <StatusIcon size={10} />
                        {sc.label}
                      </span>
                    </TableCell>

                    <TableCell className="py-3">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users size={11} />
                        {booking.participantsCount}
                      </div>
                      {booking.items.length > 0 && (
                        <p className="text-xs text-muted-foreground/60 mt-0.5">
                          {booking.items
                            .map((i) => `${i.quantity} ${i.passengerType}`)
                            .join(", ")}
                        </p>
                      )}
                    </TableCell>

                    <TableCell className="py-3">
                      <span className="text-sm font-medium">
                        {fmtCurrency(booking.totalAmount, booking.currency)}
                      </span>
                    </TableCell>

                    <TableCell className="py-3 text-xs leading-tight font-mono">
                      <p className="text-muted-foreground">Created</p>
                      <p className="font-medium">
                        {fmtDate(booking.createdAt)}
                      </p>
                    </TableCell>

                    <TableCell className="py-3 text-xs leading-tight font-mono">
                      <p className="text-muted-foreground">Updated</p>
                      <p className="font-medium text-muted">
                        {fmtDate(booking.updatedAt)}
                      </p>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-between mt-4">
          <p className="text-xs text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1}–
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} bookings
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={!pagination.hasPrevPage}
              onClick={() => setPage(pageFromUrl - 1)}
            >
              Prev
            </Button>

            <Button
              size="sm"
              disabled={!pagination.hasNextPage}
              onClick={() => setPage(pageFromUrl + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {drawerBooking && (
        <BookingDrawer
          booking={drawerBooking}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onOptimisticUpdate={handleOptimisticUpdate}
        />
      )}
    </>
  );
}
