"use client";

import { useEffect, useState, useTransition } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Baby,
  CalendarDays,
  Clock,
  PersonStanding,
  RefreshCw,
  UserRound,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtDate } from "@/lib/utils";
import {
  BookingItem,
  ProviderBookingShape,
  STATUS_TRANSITIONS,
} from "@/lib/panel-types";
import { BookingStatus } from "@/lib/all-types";
import { statusConfig } from "./BookingTable";
import { fmtCurrency, fmtDateTime, initials } from "@/lib/helpers";
import { StatusActions } from "./BookingsLayout";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const passengerIcons: Record<
  BookingItem["passengerType"],
  React.ElementType
> = {
  adult: UserRound,
  child: PersonStanding,
  infant: Baby,
};

interface BookingDrawerProps {
  booking: ProviderBookingShape;
  open: boolean;
  onClose: () => void;
}

export function BookingDrawer({ booking, open, onClose }: BookingDrawerProps) {
  const [pending, startT] = useTransition();

  if (!booking) return null;

  const sc = statusConfig[booking.status];
  const StatusIcon = sc.icon;
  const canReschedule =
    booking.status === "pending" || booking.status === "confirmed";

  async function onTransition(bookingId: string, status: BookingStatus) {
    //
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-120 overflow-y-auto p-0"
      >
        {/* ── header */}
        <div className="sticky top-0 z-10 bg-background border-b border-border">
          <SheetHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={onClose}
                        aria-label="Close"
                        className="md:hidden p-1.5 rounded-md border border-border hover:bg-muted transition"
                      >
                        <ArrowLeft size={16} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Back</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <div>
                  <SheetTitle className="text-base font-semibold">
                    Booking #{booking.orderNumber}
                  </SheetTitle>
                  <SheetDescription className="text-xs mt-0.5">
                    Created {fmtDateTime(booking.createdAt)}
                  </SheetDescription>
                </div>
              </div>

              {/* Status */}
              <span
                className={cn(
                  "text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5 shrink-0",
                  sc.pill,
                )}
              >
                <StatusIcon size={11} />
                {sc.label}
              </span>
            </div>
          </SheetHeader>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* ── Customer ── */}
          <section>
            <SectionLabel>Customer</SectionLabel>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={booking.user.image ?? undefined} />
                <AvatarFallback className="text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  {initials(booking.user.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{booking.user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {booking.user.email}
                </p>
              </div>
            </div>
          </section>

          <Separator />

          {/* ── Product & variant ── */}
          <section>
            <SectionLabel>Product & Schedule</SectionLabel>
            <div className="rounded-lg border bg-muted/30 p-3 space-y-2.5">
              <Field label="Product">{booking.productTitle}</Field>
              <Field label="Variant">{booking.variant.name}</Field>

              {(booking.variant.startDate || booking.variant.startDate) && (
                <div className="flex items-center gap-4 flex-wrap">
                  {booking.variant.startDate && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarDays size={12} />
                      {fmtDate(booking.variant.startDate)}
                      {booking.variant.endDate &&
                        booking.variant.endDate !== booking.variant.startDate &&
                        ` → ${fmtDate(booking.variant.endDate)}`}
                    </div>
                  )}
                  {booking.variant.startDate && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock size={12} />
                      {fmtDateTime(booking.variant.startDate)}
                      {booking.variant.endDate &&
                        ` – ${fmtDateTime(booking.variant.endDate)}`}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Reschedule */}
            {canReschedule && (
              <div className="mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-xs h-7 text-muted-foreground"
                >
                  <RefreshCw size={12} />
                  Reschedule to different variant
                </Button>
              </div>
            )}
          </section>

          <Separator />

          {/* ── Participants ── */}
          <section>
            <SectionLabel>
              Participants · {booking.participantsCount} total
            </SectionLabel>
            {booking.items.length > 0 ? (
              <div className="space-y-2">
                {booking.items.map((item) => {
                  const Icon = passengerIcons[item.passengerType];
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg bg-muted/30 border px-3 py-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <Icon size={14} className="text-muted-foreground" />
                        <span className="text-sm capitalize">
                          {item.passengerType}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          × {item.quantity}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {fmtCurrency(item.totalPrice, booking.currency)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {fmtCurrency(item.unitPrice, booking.currency)} ea.
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No item breakdown available.
              </p>
            )}
          </section>

          <Separator />

          {/* ── Payment ── */}
          <section>
            <SectionLabel>Payment</SectionLabel>
            <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
              <span className="text-sm text-muted-foreground">
                Total amount
              </span>
              <span className="text-lg font-semibold">
                {fmtCurrency(booking.totalAmount, booking.currency)}
              </span>
            </div>
          </section>

          <Separator />

          {/* ── Timeline ── */}
          <section>
            <SectionLabel>Timeline</SectionLabel>
            <div className="space-y-2 text-sm">
              {[
                { label: "Booked", value: fmtDateTime(booking.createdAt) },
                { label: "Completed", value: fmtDateTime(booking.completedAt) },
                { label: "Cancelled", value: fmtDateTime(booking.canceledAt) },
              ]
                .filter((t) => t.value !== "—")
                .map((t) => (
                  <div key={t.label} className="flex justify-between">
                    <span className="text-muted-foreground">{t.label}</span>
                    <span className="font-medium">{t.value}</span>
                  </div>
                ))}
            </div>
          </section>

          <Separator />

          <section>
            <SectionLabel>Actions</SectionLabel>
            <StatusActions booking={booking} onTransition={onTransition} />
            {STATUS_TRANSITIONS[booking.status].length === 0 && (
              <p className="text-xs text-muted-foreground">
                No further actions available for a {booking.status} booking.
              </p>
            )}
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
      {children}
    </p>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium mt-0.5">{children}</p>
    </div>
  );
}
