"use client";

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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Baby,
  CalendarDays,
  Clock,
  PersonStanding,
  RefreshCw,
  UserRound,
  ArrowLeft,
  CheckCircle2,
  Ban,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtDate } from "@/lib/utils";
import {
  BookingItem,
  ProviderBookingShape,
  STATUS_TRANSITIONS,
} from "@/lib/panel-types";
import { statusConfig } from "./BookingTable";
import { fmtCurrency, fmtDateTime, initials } from "@/lib/helpers";
import { useBooking } from "@/hooks/useBooking";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  onOptimisticUpdate: (
    bookingId: string,
    patch: Partial<ProviderBookingShape>,
  ) => void;
}

interface ActionButtonProps {
  label: string;
  loadingLabel: string;
  icon: React.ElementType;
  variant: "default" | "destructive" | "outline" | "ghost";
  isLoading: boolean;
  anyPending: boolean;
  onClick: () => void;
  className?: string;
}

function ActionButton({
  label,
  loadingLabel,
  icon: Icon,
  variant,
  isLoading,
  anyPending,
  onClick,
  className,
}: ActionButtonProps) {
  return (
    <Button
      variant={variant}
      size="sm"
      className={cn("gap-2 text-xs h-9 min-w-35 relative", className)}
      disabled={anyPending}
      onClick={onClick}
    >
      {isLoading ? (
        <span className="absolute inset-0 flex items-center justify-center gap-1.5">
          <Loader2 className="animate-spin size-4" />
          {loadingLabel}
        </span>
      ) : (
        <>
          <span className={cn("flex items-center gap-1.5")}>
            <Icon size={13} />
            {label}
          </span>
        </>
      )}
    </Button>
  );
}

function CancelAction({
  booking,
  onConfirmedCancel,
  isLoading,
  anyPending,
}: {
  booking: ProviderBookingShape;
  onConfirmedCancel: () => void;
  isLoading: boolean;
  anyPending: boolean;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          className="gap-1.5 text-xs h-9 min-w-30"
          disabled={anyPending}
        >
          {isLoading ? (
            <>
              <Loader2 size={13} className="animate-spin shrink-0" />
              Cancelling…
            </>
          ) : (
            <>
              <Ban size={13} className="shrink-0" />
              Cancel booking
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Cancel booking #{booking.orderNumber}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This booking will be permanently cancelled. This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep booking</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            onClick={onConfirmedCancel}
          >
            Yes, cancel it
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function BookingDrawer({
  booking,
  open,
  onClose,
  onOptimisticUpdate,
}: BookingDrawerProps) {
  const { cancel, confirm, pendingAction, pendingBookingId, complete } =
    useBooking();

  const isThisBooking = pendingBookingId === booking?.id;
  const isConfirming = isThisBooking && pendingAction === "confirm";
  const isCancelling = isThisBooking && pendingAction === "cancel";
  const isCompleting = isThisBooking && pendingAction === "complete";
  const anyPending = pendingAction !== null;

  if (!booking) return null;

  const sc = statusConfig[booking.status];
  const StatusIcon = sc.icon;
  const allowed = STATUS_TRANSITIONS[booking.status];
  const canReschedule =
    booking.status === "pending" || booking.status === "confirmed";

  function handleConfirm() {
    confirm(booking.id, {
      onSuccess(data) {
        onOptimisticUpdate(booking.id, {
          ...data,
        });
      },
      onError() {
        onOptimisticUpdate(booking.id, {
          status: booking.status,
          canceledAt: booking.canceledAt ?? null,
        });
      },
    });
  }

  function handleCancel() {
    cancel(booking.id, {
      role: "provider",
      onSuccess: () => {
        onOptimisticUpdate(booking.id, {
          status: "cancelled",
          canceledAt: new Date(),
        });
      },
      onError() {
        onOptimisticUpdate(booking.id, {
          status: booking.status,
          canceledAt: booking.canceledAt ?? null,
        });
      },
    });
  }

  function handleComplete() {
    complete(booking.id, {
      onSuccess: (data) => {
        onOptimisticUpdate(booking.id, {
          ...data,
        });
      },
      onError() {
        onOptimisticUpdate(booking.id, {
          status: booking.status,
          completedAt: booking.completedAt ?? null,
        });
      },
    });
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-120 overflow-y-auto p-0"
      >
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

          {booking.status === "pending" && (
            <Alert className="border-yellow-300 bg-yellow-50 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300">
              <AlertTriangle className="h-4 w-4" />

              <AlertTitle className="text-sm font-medium">
                Pending booking
              </AlertTitle>

              <AlertDescription className="text-xs">
                This booking will be automatically cancelled after 15 minutes.
                It will expire at{" "}
                <span className="font-medium">
                  {fmtDateTime(
                    new Date(
                      new Date(booking.createdAt).getTime() + 15 * 60 * 1000,
                    ),
                  )}
                </span>
              </AlertDescription>
            </Alert>
          )}

          {/* ── Product & variant ── */}
          <section>
            <SectionLabel>Product & Schedule</SectionLabel>
            <div className="rounded-lg border bg-muted/30 p-3 space-y-2.5">
              <Field label="Product">{booking.productTitle}</Field>
              <Field label="Variant">{booking.variant.name}</Field>

              {(booking.variant.startDate || booking.variant.endDate) && (
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
                    <span className="font-medium tabular-nums">{t.value}</span>
                  </div>
                ))}
            </div>
          </section>

          <Separator />

          {/* ── Actions ── */}
          <section>
            <SectionLabel>Actions</SectionLabel>

            <div className="flex flex-wrap gap-2">
              {allowed.includes("confirmed") && (
                <ActionButton
                  label="Confirm booking"
                  loadingLabel="Confirming…"
                  icon={CheckCircle2}
                  variant="default"
                  isLoading={isConfirming}
                  anyPending={anyPending}
                  onClick={handleConfirm}
                />
              )}

              {allowed.includes("completed") && (
                <ActionButton
                  label="Complete booking"
                  loadingLabel="Completing…"
                  icon={CheckCircle2}
                  variant="default"
                  isLoading={isCompleting}
                  anyPending={anyPending}
                  onClick={handleComplete}
                />
              )}

              {allowed.includes("cancelled") && (
                <CancelAction
                  booking={booking}
                  onConfirmedCancel={handleCancel}
                  isLoading={isCancelling}
                  anyPending={anyPending}
                />
              )}
            </div>

            {allowed.length === 0 && (
              <p className="text-xs text-muted-foreground mt-1">
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
