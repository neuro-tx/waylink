import { redirect } from "next/navigation";
import { BadgeCheck, BookMarkedIcon, CheckCircle2 } from "lucide-react";
import { bookingsService } from "@/services/bookings.service";
import { BookingCard, BookingsPagination } from "../_components/BookingCom";
import { getAuthSession } from "@/lib/auth-server";
import { CalendarDays, Clock3, XCircle } from "lucide-react";

type BookingStatsBoxProps = {
  total: number;
  completed: number;
  pending: number;
  confirmed: number;
  cancelled: number;
};

function EmptyState() {
  return (
    <div className="rounded-2xl border bg-card py-20 flex flex-col items-center gap-4 text-center">
      <span className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
        <BookMarkedIcon className="w-7 h-7 text-muted-foreground/50" />
      </span>
      <div>
        <p className="font-semibold text-foreground">No bookings yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          When you book an product, it'll show up here.
        </p>
      </div>
    </div>
  );
}

export default async function MyBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getAuthSession();
  if (!session?.user?.id) redirect("/");

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));

  const [{ data: bookings, totalPages }, stats] = await Promise.all([
    bookingsService.getBookingsByUserId(session.user.id, page),
    bookingsService.getBookingStatsByUserId(session.user.id),
  ]);

  return (
    <div className="px-4 md:px-6 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          My Bookings
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          All your upcoming and past experiences in one place.
        </p>
      </div>

      <BookingStatsBox
        total={stats.total}
        completed={stats.completed}
        pending={stats.pending}
        confirmed={stats.confirmed}
        cancelled={stats.cancelled}
      />

      {bookings.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {bookings.map((booking, i) => (
            <BookingCard key={booking.id} booking={booking} index={i} />
          ))}

          <BookingsPagination page={page} totalPages={totalPages} />
        </div>
      )}
    </div>
  );
}

function BookingStatsBox({
  total,
  completed,
  pending,
  confirmed,
  cancelled,
}: BookingStatsBoxProps) {
  const items = [
    {
      label: "Total",
      value: total,
      icon: CalendarDays,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600",
      textColor: "text-blue-700 dark:text-blue-400",
    },
    {
      label: "Completed",
      value: completed,
      icon: CheckCircle2,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
      textColor: "text-emerald-700 dark:text-emerald-400",
    },
    {
      label: "Pending",
      value: pending,
      icon: Clock3,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600",
      textColor: "text-amber-700 dark:text-amber-400",
    },
    {
      label: "Confirmed",
      value: confirmed,
      icon: BadgeCheck,
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-600",
      textColor: "text-violet-700 dark:text-violet-400",
    },
    {
      label: "Cancelled",
      value: cancelled,
      icon: XCircle,
      iconBg: "bg-rose-500/10",
      iconColor: "text-rose-600",
      textColor: "text-rose-700 dark:text-rose-400",
    },
  ];
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="relative overflow-hidden rounded-3xl border bg-background/80 p-5 shadow-sm backdrop-blur supports-backdrop-filter:bg-background/70">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-muted/20" />

      <div className="relative space-y-5">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Booking Overview
          </p>
          <h3 className="text-xl font-semibold tracking-tight">
            Your Bookings
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="rounded-2xl border hover:drop-shadow-sm bg-card p-3 transition-all"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className={`rounded-xl p-2 ${item.iconBg}`}>
                    <Icon className={`h-4 w-4 ${item.iconColor}`} />
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className={`text-xl font-bold ${item.textColor}`}>
                  {item.value}
                </p>
              </div>
            );
          })}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Completion Rate</span>
            <span>{completionRate}%</span>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-purple-500 transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
