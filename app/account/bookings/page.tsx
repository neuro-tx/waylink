import { redirect } from "next/navigation";
import { BadgeCheck, BookMarkedIcon, CheckCircle2, Wallet } from "lucide-react";
import { bookingsService } from "@/services/bookings.service";
import { BookingCard, BookingsPagination } from "../_components/BookingCom";
import { getAuthSession } from "@/lib/auth-server";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent: string;
  className?: string;
};

export function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/60 bg-card/95 px-5 py-5 md:py-7 shrink-0",
        "shadow-sm transition-all duration-300",
        "hover:shadow-md hover:border-border",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl opacity-20 transition-opacity duration-300 group-hover:opacity-30"
        style={{ backgroundColor: accent }}
      />
      <div
        className="absolute inset-x-0 top-0 h-0.5 opacity-80"
        style={{
          background: `linear-gradient(90deg, ${accent} 0%, transparent 100%)`,
        }}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            {label}
          </p>

          <p className="text-3xl font-bold tracking-tight text-foreground sm:text-[2rem]">
            {value}
          </p>
        </div>

        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition-transform duration-300 aspect-square"
          style={{
            backgroundColor: `${accent}14`,
            borderColor: `${accent}26`,
            color: accent,
          }}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

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

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard
          label="Total Bookings"
          value={stats.total}
          icon={BookMarkedIcon}
          accent="#845EF7"
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          icon={CheckCircle2}
          accent="#00C9A7"
        />
        <StatCard
          label="Confirmed"
          value={stats.confirmed}
          icon={BadgeCheck}
          accent="#3Bc0F6"
        />
        <StatCard
          label="Total Invested"
          value={
            stats.totalInvested > 0
              ? `$${stats.totalInvested.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : "$0.00"
          }
          icon={Wallet}
          accent="#FF6B35"
        />
      </div>

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
