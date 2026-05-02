"use client";

import { useState, memo, useMemo } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookingStatus } from "@/lib/all-types";
import { LatestBooking } from "@/lib/panel-types";
import { initials } from "@/lib/helpers";
import { timeAgo, cn } from "@/lib/utils";
import { Users, History, Inbox } from "lucide-react";

const STATUS_VARIANTS: Record<
  BookingStatus,
  { label: string; badge: string; dot: string }
> = {
  confirmed: {
    label: "Confirmed",
    badge:
      "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200/50 dark:border-blue-500/20",
    dot: "bg-blue-500",
  },
  completed: {
    label: "Completed",
    badge:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  pending: {
    label: "Pending",
    badge:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200/50 dark:border-amber-500/20",
    dot: "bg-amber-500",
  },
  cancelled: {
    label: "Cancelled",
    badge:
      "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200/50 dark:border-red-500/20",
    dot: "bg-red-500",
  },
  expired: {
    label: "Expired",
    badge:
      "bg-neutral-100 text-neutral-700 dark:bg-neutral-500/10 dark:text-neutral-400 border-neutral-200/50 dark:border-neutral-500/20",
    dot: "bg-neutral-500",
  },
};

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
];

function getStringHash(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

const BookingRow = memo(function BookingRow({
  booking,
}: {
  booking: LatestBooking;
}) {
  const status = STATUS_VARIANTS[booking.status];

  const colorIndex = useMemo(
    () => getStringHash(booking.customerName) % AVATAR_COLORS.length,
    [booking.customerName],
  );
  const avatarColor = AVATAR_COLORS[colorIndex];

  return (
    <div className="group flex items-center justify-between gap-4 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/40 sm:px-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar
          image={booking.image}
          name={booking.customerName}
          color={avatarColor}
        />
        <div className="min-w-0 space-y-0.5">
          <p className="truncate text-sm font-semibold text-foreground leading-none">
            {booking.customerName}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            {timeAgo(booking.createdAt)}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 gap-4 sm:gap-6">
        <div className="flex items-center gap-1.5 text-sm font-medium text-foreground tracking-tight">
          <Users
            className="size-3.5 text-muted-foreground"
            aria-hidden="true"
          />
          {booking.amount.toLocaleString()}
        </div>

        <div className="w-22.5">
          <Badge
            variant="outline"
            className={cn(
              "justify-center h-6 px-2 text-xs font-medium transition-colors shadow-none",
              status.badge,
            )}
          >
            <span
              className={cn("mr-1.5 size-1.5 rounded-full", status.dot)}
              aria-hidden="true"
            />
            {status.label}
          </Badge>
        </div>
      </div>
    </div>
  );
});

export function RecentBookings({ bookings }: { bookings: LatestBooking[] }) {
  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle>
          Recent Bookings
        </CardTitle>
        <CardDescription>
          Latest activity across your offerings.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-4">
        {bookings.length > 0 ? (
          <div className="space-y-1">
            <div className="px-4 pb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span className="flex-1">Customer</span>
              <div className="flex shrink-0 items-center gap-6">
                <span className="w-10">Pax</span>
                <span className="w-22.5">Status</span>
              </div>
            </div>

            <div className="flex flex-col space-y-0.5">
              {bookings.map((booking) => (
                <BookingRow key={booking.id} booking={booking} />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-62.5 flex-col items-center justify-center space-y-3 rounded-xl border border-dashed border-border p-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <Inbox
                className="size-6 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            <div>
              <p className="text-sm font-semibold">No recent bookings</p>
              <p className="text-xs text-muted-foreground max-w-50 mt-1">
                When customers book your assets, they will show up here.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Avatar({
  image,
  name,
  color,
}: {
  image?: string | null;
  name: string;
  color: string;
}) {
  const [imgError, setImgError] = useState(false);
  const showImage = Boolean(image && image.trim() !== "") && !imgError;

  return (
    <div
      className={cn(
        "relative flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold shadow-sm",
        !showImage && color,
      )}
    >
      {showImage ? (
        <Image
          src={image!}
          alt={name}
          fill
          className="rounded-full object-cover"
          sizes="36px"
          onError={() => setImgError(true)}
        />
      ) : (
        <span>{initials(name)}</span>
      )}
    </div>
  );
}
