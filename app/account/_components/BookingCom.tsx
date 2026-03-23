"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calendar,
  Clock,
  Users,
  ChevronDown,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Loader2,
  Star,
  Baby,
  UserRound,
  ReceiptText,
  Ticket,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Trash2,
  Headset,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Booking, BookingStatus, PassengerType } from "@/lib/all-types";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface PaginationProps {
  page: number;
  totalPages: number;
}
interface BookingActionsProps {
  bookingId: string;
  status: BookingStatus;
}

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  confirmClass?: string;
  onConfirm: () => void;
  loading: boolean;
}

const STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; icon: React.ReactNode; badgeClass: string }
> = {
  pending: {
    label: "Pending",
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
    badgeClass:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  },
  confirmed: {
    label: "Confirmed",
    icon: <CheckCircle2 className="h-3 w-3" />,
    badgeClass:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  },
  cancelled: {
    label: "Cancelled",
    icon: <XCircle className="h-3 w-3" />,
    badgeClass:
      "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800",
  },
  completed: {
    label: "Completed",
    icon: <Star className="h-3 w-3" />,
    badgeClass:
      "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 border-sky-200 dark:border-sky-800",
  },
};

const PASSENGER_ICONS: Record<PassengerType, React.ReactNode> = {
  adult: <UserRound className="h-3.5 w-3.5" />,
  children: <Users className="h-3.5 w-3.5" />,
  infant: <Baby className="h-3.5 w-3.5" />,
};

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", { dateStyle: "medium" });
}

function formatDuration(start: Date | string, end: Date | string | null) {
  if (!end) return null;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export function BookingCard({
  booking,
  index,
}: {
  booking: Booking;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[booking.status as BookingStatus];

  const cover = booking.product.media?.[0]?.url;
  const duration = formatDuration(
    booking.variant.startDate,
    booking.variant.endDate,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.32,
        delay: index * 0.06,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      layout
      className={cn(
        "group relative rounded-2xl border bg-card overflow-hidden",
        "shadow-sm hover:shadow-md transition-shadow duration-300",
        booking.status === "cancelled" && "opacity-70 hover:opacity-100",
      )}
    >
      <div className="flex">
        {cover && (
          <div className="relative hidden sm:block w-62 aspect-video shrink-0 overflow-hidden">
            <Image
              src={cover}
              alt={booking.product.title}
              className={cn(
                "h-full w-full object-cover transition-transform duration-500 group-hover:scale-101",
                booking.status === "cancelled" && "grayscale",
              )}
              fill
            />
            <div className="absolute inset-0 bg-linear-to-r from-transparent to-card/10" />
          </div>
        )}

        <div className="flex flex-1 flex-col p-5 gap-3 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-mono tracking-wide mb-1">
                {booking.orderNumber}
              </p>
              <h3 className="font-semibold text-base leading-snug text-foreground truncate">
                {booking.product.title}
              </h3>
              {booking.variant.name && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {booking.variant.name}
                </p>
              )}
            </div>
            <Badge
              variant="outline"
              className={cn("shrink-0 py-1", cfg.badgeClass)}
            >
              {cfg.icon}
              {cfg.label}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              {formatDate(booking.variant.startDate)}
            </span>
            {duration && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                {duration}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 shrink-0" />
              {booking.participantsCount}{" "}
              {booking.participantsCount === 1 ? "guest" : "guests"}
            </span>
          </div>

          <div className="flex items-center justify-between mt-auto pt-1 flex-wrap gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-lg font-bold text-foreground leading-tight">
                {booking.currency} {parseFloat(booking.totalAmount).toFixed(2)}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {booking.status === "confirmed" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-8 gap-1"
                >
                  <Ticket className="h-3.5 w-3.5" />
                  View ticket
                </Button>
              )}

              {booking.status === "completed" && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  Reviewed
                </span>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="text-xs h-8 gap-1 text-muted-foreground"
                onClick={() => setExpanded((p) => !p)}
              >
                <ReceiptText className="h-3.5 w-3.5" />
                Details
                <motion.span
                  animate={{ rotate: expanded ? 180 : 0 }}
                  transition={{ duration: 0.22 }}
                  className="inline-flex"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </motion.span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <Separator />
            <div className="px-5 py-4 bg-muted/30 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  Booking breakdown
                </p>
                <div className="space-y-2">
                  {booking.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="flex items-center gap-2 text-muted-foreground capitalize">
                        {PASSENGER_ICONS[item.passengerType as PassengerType]}
                        {item.passengerType} × {item.quantity}
                      </span>
                      <span className="text-foreground">
                        {booking.currency}{" "}
                        {parseFloat(item.unitPrice).toFixed(2)} ×{" "}
                        {item.quantity} ={" "}
                        <span className="font-semibold">
                          {booking.currency}{" "}
                          {parseFloat(item.totalPrice).toFixed(2)}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>

                <Separator className="my-3" />

                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-muted-foreground">Total</span>
                  <span>
                    {booking.currency}{" "}
                    {parseFloat(booking.totalAmount).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                <span>Booked: {formatDate(booking.createdAt)}</span>
                {booking.canceledAt && (
                  <span className="text-rose-500">
                    Cancelled: {formatDate(booking.canceledAt)}
                  </span>
                )}
                {booking.completedAt && (
                  <span className="text-sky-500">
                    Completed: {formatDate(booking.completedAt)}
                  </span>
                )}
              </div>

              <BookingActions bookingId={booking.id} status={booking.status} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function BookingsPagination({ page, totalPages }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function goTo(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`${pathname}?${params.toString()}`);
  }

  function getPages(): (number | "...")[] {
    if (totalPages <= 5)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, "...", totalPages];
    if (page >= totalPages - 2)
      return [1, "...", totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  }

  return (
    <div className="flex items-center justify-center gap-1 pt-4">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        disabled={page <= 1}
        onClick={() => goTo(page - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {getPages().map((p, i) =>
        p === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="px-1 text-sm text-muted-foreground select-none"
          >
            …
          </span>
        ) : (
          <Button
            key={p}
            variant={p === page ? "default" : "outline"}
            size="icon"
            className={cn(
              "h-8 w-8 text-xs",
              p === page && "pointer-events-none",
            )}
            onClick={() => goTo(p as number)}
          >
            {p}
          </Button>
        ),
      )}

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        disabled={page >= totalPages}
        onClick={() => goTo(page + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  confirmClass,
  onConfirm,
  loading,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className={confirmClass}
          >
            {loading ? "Please wait…" : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function BookingActions({ bookingId, status }: BookingActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [hideOpen, setHideOpen] = useState(false);

  const dangerBtn =
    "text-xs h-8 text-rose-500 border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950";

  if (status === "pending") {
    return (
      <>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" className="text-xs h-8 gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            View details
          </Button>
          <Button size="sm" variant="outline" className="text-xs h-8 gap-1.5">
            <Headset className="h-3.5 w-3.5" />
            Contact support
          </Button>
          <Button
            size="sm"
            variant="outline"
            className={`gap-1.5 ${dangerBtn}`}
            onClick={() => setCancelOpen(true)}
            disabled={isPending}
          >
            <XCircle className="h-3.5 w-3.5" />
            Cancel booking
          </Button>
        </div>

        <ConfirmDialog
          open={cancelOpen}
          onOpenChange={setCancelOpen}
          title="Cancel this booking?"
          description="This action cannot be undone. You may be subject to a cancellation fee depending on the provider's policy."
          confirmLabel="Yes, cancel booking"
          confirmClass="bg-rose-500 hover:bg-rose-600 text-white"
          onConfirm={() => {}}
          loading={isPending}
        />
      </>
    );
  }

  if (status === "confirmed") {
    return (
      <>
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            className="text-xs h-8 gap-1.5"
            onClick={() => router.push(`/account/bookings/${bookingId}/map`)}
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
            View on map
          </Button>
          <Button size="sm" variant="outline" className="text-xs h-8 gap-1.5">
            <Headset className="h-3.5 w-3.5" />
            Contact support
          </Button>
          <Button
            size="sm"
            variant="outline"
            className={`gap-1.5 ${dangerBtn}`}
            onClick={() => setCancelOpen(true)}
            disabled={isPending}
          >
            <XCircle className="h-3.5 w-3.5" />
            Cancel booking
          </Button>
        </div>

        <ConfirmDialog
          open={cancelOpen}
          onOpenChange={setCancelOpen}
          title="Cancel this booking?"
          description="This action cannot be undone. You may be subject to a cancellation fee depending on the provider's policy."
          confirmLabel="Yes, cancel booking"
          confirmClass="bg-rose-500 hover:bg-rose-600 text-white"
          onConfirm={() => {}}
          loading={isPending}
        />
      </>
    );
  }

  if (status === "cancelled") {
    return (
      <>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" className="text-xs h-8 gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            Rebook
          </Button>
          <Button
            size="sm"
            variant="outline"
            className={`gap-1.5 ${dangerBtn}`}
            onClick={() => setHideOpen(true)}
            disabled={isPending}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove from list
          </Button>
        </div>

        <ConfirmDialog
          open={hideOpen}
          onOpenChange={setHideOpen}
          title="Remove from your list?"
          description="This booking will no longer appear in your list."
          confirmLabel="Remove"
          confirmClass="bg-rose-500 hover:bg-rose-600 text-white"
          onConfirm={() => {}}
          loading={isPending}
        />
      </>
    );
  }

  return null;
}
