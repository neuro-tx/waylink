"use client";

import { useState } from "react";
import {
  Clock,
  Users,
  CreditCard,
  MapPin,
  Minus,
  Plus,
  CalendarX2,
} from "lucide-react";
import { cn, fmtDate, parseArray } from "@/lib/utils";
import { ProductVariant } from "@/lib/all-types";
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
import { Button } from "../ui/button";

interface VariantCardProps {
  variant: ProductVariant;
  selected: boolean;
  pax: Pax;
  onSelect: () => void;
  onSetPax: (type: keyof Pax, val: number) => void;
  onBook: () => void;
}

type Stop = {
  locationName: string;
  arrivalTime: string;
  departureTime: string;
};

interface VariantListProps {
  variants: ProductVariant[];
  onConfirmBooking?: (variant: ProductVariant, pax: Pax) => void;
}

type Pax = { adult: number; child: number; infant: number };

function fmtTime(d: string | Date) {
  return new Date(d).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function fmtDur(m: number) {
  const h = Math.floor(m / 60),
    mn = m % 60;
  return mn > 0 ? `${h}h ${mn}m` : `${h}h`;
}

function fmtMoney(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

function fmtMoneyStr(s: string) {
  return fmtMoney(parseFloat(s));
}

function fmtDay(d: string | Date) {
  return new Date(d).getDate();
}

function fmtMon(d: string | Date) {
  return new Date(d).toLocaleString("en-US", { month: "short" });
}

function availFill(pct: number) {
  if (pct >= 0.7) return "bg-red-400";
  if (pct >= 0.4) return "bg-amber-400";
  return "bg-emerald-500";
}

function computeTotal(variant: ProductVariant, pax: Pax) {
  if (!variant.pricing) return 0;
  return (
    pax.adult * parseFloat(variant.pricing.adultPrice) +
    pax.child * parseFloat(variant.pricing.childPrice) +
    pax.infant * parseFloat(variant.pricing.infantPrice)
  );
}

// ─── confirm dialog ───────────────────────────────────────────────────────────

interface BookingConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: ProductVariant;
  pax: Pax;
  onConfirm: () => void;
}

function BookingConfirmDialog({
  open,
  onOpenChange,
  variant,
  pax,
  onConfirm,
}: BookingConfirmDialogProps) {
  const { pricing, transportSchedule: schedule, name } = variant;
  const adultTotal = pax.adult * parseFloat(pricing?.adultPrice ?? "0");
  const childTotal = pax.child * parseFloat(pricing?.childPrice ?? "0");
  const infantTotal = pax.infant * parseFloat(pricing?.infantPrice ?? "0");
  const grandTotal = adultTotal + childTotal + infantTotal;
  const totalPax = pax.adult + pax.child + pax.infant;

  const rows = [
    {
      label: "Adults",
      sub: `× ${pax.adult}`,
      amount: adultTotal,
      show: pax.adult > 0,
    },
    {
      label: "Children",
      sub: `× ${pax.child}`,
      amount: childTotal,
      show: pax.child > 0,
    },
    {
      label: "Infants",
      sub: `× ${pax.infant}`,
      amount: infantTotal,
      show: pax.infant > 0,
    },
  ].filter((r) => r.show);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="gap-0 p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <p className="text-xs text-muted-foreground font-medium tracking-wider mb-0.5">
            Confirm your booking
          </p>
          <h2 className="text-lg font-semibold">{name}</h2>
          {schedule && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {fmtTime(schedule.departureTime)} →{" "}
              {fmtTime(schedule.arrivalTime)}
              <span className="text-blue-500 ml-2">
                · {fmtDur(schedule.duration)}
              </span>
            </p>
          )}
        </div>

        <AlertDialogHeader className="px-5 pt-4 pb-0 gap-0">
          <AlertDialogTitle className="sr-only">
            Confirm booking
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Passengers · {totalPax} total
              </p>
              <div className="space-y-2 mb-4">
                {rows.map((r) => (
                  <div
                    key={r.label}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground">{r.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {r.sub}
                      </span>
                    </div>
                    <span className="text-sm text-foreground">
                      {fmtMoney(r.amount)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-3 flex items-center justify-between">
                <span className="text-sm font-medium">Total</span>
                <span className="text-base font-semibold text-blue-500">
                  {fmtMoney(grandTotal)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                By confirming, you agree to the booking terms. This action
                cannot be undone.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="px-5 pb-5 pt-4 flex-row gap-2">
          <AlertDialogCancel className="flex-1 m-0">Cancel</AlertDialogCancel>
          <AlertDialogAction className="flex-1" onClick={onConfirm}>
            Confirm booking
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function StepperRow({
  label,
  sub,
  price,
  count,
  onDec,
  onInc,
  decDisabled,
  incDisabled,
}: {
  label: string;
  sub: string;
  price: string;
  count: number;
  onDec: () => void;
  onInc: () => void;
  decDisabled: boolean;
  incDisabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground w-14 text-right">
          {fmtMoneyStr(price)}
        </span>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="icon"
            onClick={onDec}
            disabled={decDisabled}
            className="size-7 rounded-full shrink-0"
          >
            <Minus className="size-3.5" />
          </Button>
          <span className="text-sm font-medium w-4 text-center tabular-nums">
            {count}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={onInc}
            disabled={incDisabled}
            className="size-7 rounded-full shrink-0"
          >
            <Plus className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function DateBlock({
  date,
  selected,
}: {
  date: string | Date;
  selected: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center w-11 h-11 rounded-lg border shrink-0 transition-colors",
        selected
          ? "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800"
          : "bg-muted/60 border-border",
      )}
    >
      <span
        className={cn(
          "text-lg font-semibold leading-none",
          selected ? "text-blue-700 dark:text-blue-300" : "text-foreground",
        )}
      >
        {fmtDay(date)}
      </span>
      <span
        className={cn(
          "text-[10px] uppercase tracking-wide mt-0.5",
          selected
            ? "text-blue-500 dark:text-blue-400"
            : "text-muted-foreground",
        )}
      >
        {fmtMon(date)}
      </span>
    </div>
  );
}

function VariantCard({
  variant,
  selected,
  pax,
  onSelect,
  onSetPax,
  onBook,
}: VariantCardProps) {
  const {
    transportSchedule: sc,
    pricing,
    status,
    capacity,
    bookedCount,
    name,
  } = variant;
  const avail = capacity - bookedCount;
  const pct = bookedCount / capacity;
  const totalPax = pax.adult + pax.child + pax.infant;
  const maxPax = Math.min(avail, 12);
  const total = computeTotal(variant, pax);
  const disabled = status !== "available";
  const stops = parseArray<Stop>(sc?.stops);

  const statusCls = {
    available:
      "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
    sold_out: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
    cancelled: "bg-muted text-muted-foreground",
  }[status];

  const statusLabel = {
    available: "Available",
    sold_out: "Sold out",
    cancelled: "Cancelled",
  }[status];

  return (
    <div
      className={cn(
        "rounded-xl overflow-hidden border transition-all duration-200",
        selected ? "border-blue-300 dark:border-blue-800" : "border-border",
        disabled && "opacity-50",
      )}
    >
      <button
        onClick={onSelect}
        disabled={disabled}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/40 transition-colors disabled:cursor-not-allowed border-b border-border"
      >
        <DateBlock date={variant.startDate} selected={selected} />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {name ?? "Unnamed variant"}
          </p>
          {sc && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {fmtTime(sc.departureTime)} → {fmtTime(sc.arrivalTime)}
              <span className="ml-1.5 text-muted-foreground/60">
                · {fmtDur(sc.duration)}
              </span>
            </p>
          )}
        </div>

        <span
          className={cn(
            "text-xs px-2.5 py-1 rounded-full font-medium shrink-0",
            statusCls,
          )}
        >
          {statusLabel}
        </span>

        <span
          className={cn(
            "size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200",
            selected
              ? "border-blue-500 bg-blue-500"
              : "border-muted-foreground/30 bg-background",
          )}
        >
          {selected && <span className="size-2 rounded-full bg-white" />}
        </span>
      </button>

      <div className="px-4 py-4">
        {sc && (
          <div className="flex items-center gap-3 mb-4">
            <div className="text-center">
              <p className="text-2xl font-medium tracking-tight">
                {fmtTime(sc.departureTime)}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Depart</p>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full h-1 rounded-full bg-border relative">
                <span className="absolute -top-1 border left-0 size-3 rounded-full bg-muted" />
                <span className="absolute -top-1 border right-0 size-3 rounded-full bg-muted" />
              </div>
              <span className="text-xs text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full border border-border">
                {fmtDur(sc.duration)}
              </span>
            </div>
            <div className="text-center">
              <p className="text-2xl font-medium tracking-tight">
                {fmtTime(sc.arrivalTime)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Arrive</p>
            </div>
          </div>
        )}

        {stops && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {stops.map((s) => (
              <span
                key={`${s.locationName}-${s.arrivalTime}-${s.departureTime}`}
                className="flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-1 text-xs text-muted-foreground"
              >
                <MapPin className="size-3 shrink-0" />
                via {s.locationName} · {fmtDate(s.arrivalTime)} {"–"}{" "}
                {fmtDate(s.departureTime)}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-4 mb-3">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="size-3.5" />
            {avail} of {capacity} seats left
          </span>
          {sc?.checkInTime && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3.5" />
              Check-in {fmtTime(sc.checkInTime)}
            </span>
          )}
          {pricing && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CreditCard className="size-3.5" />
              From {fmtMoneyStr(pricing.adultPrice)}
            </span>
          )}
        </div>

        <div className="h-1 rounded-full bg-muted overflow-hidden mb-4">
          <div
            className={cn("h-full rounded-full transition-all", availFill(pct))}
            style={{ width: `${Math.round(pct * 100)}%` }}
          />
        </div>

        {selected && pricing && (
          <>
            <div className="border-t border-border">
              <StepperRow
                label="Adults"
                sub="Age 13+"
                price={pricing.adultPrice}
                count={pax.adult}
                onDec={() => onSetPax("adult", pax.adult - 1)}
                onInc={() => onSetPax("adult", pax.adult + 1)}
                decDisabled={pax.adult <= 0}
                incDisabled={totalPax >= maxPax}
              />
              <StepperRow
                label="Children"
                sub="Age 2–12"
                price={pricing.childPrice}
                count={pax.child}
                onDec={() => onSetPax("child", pax.child - 1)}
                onInc={() => onSetPax("child", pax.child + 1)}
                decDisabled={pax.child <= 0}
                incDisabled={totalPax >= maxPax}
              />
              <StepperRow
                label="Infants"
                sub="Under 2 · lap seat"
                price={pricing.infantPrice}
                count={pax.infant}
                onDec={() => onSetPax("infant", pax.infant - 1)}
                onInc={() => onSetPax("infant", pax.infant + 1)}
                decDisabled={pax.infant <= 0}
                incDisabled={totalPax >= maxPax || pax.infant >= pax.adult}
              />
            </div>

            <div className="flex items-center justify-between px-4 py-3 -mx-4 bg-muted/50 border-t border-border mt-2">
              <span className="text-xs text-muted-foreground">
                {totalPax} passenger{totalPax !== 1 ? "s" : ""} · total
              </span>
              <span className="text-lg font-semibold tabular-nums">
                {fmtMoney(total)}
              </span>
            </div>

            <Button
              className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={totalPax === 0}
              onClick={onBook}
            >
              {totalPax === 0
                ? "Select passengers to continue"
                : `Reserve · ${fmtMoney(total)}`}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export function VariantList({ variants, onConfirmBooking }: VariantListProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [paxMap, setPaxMap] = useState<Record<string, Pax>>({});
  const [confirmVariant, setConfirmVariant] = useState<ProductVariant | null>(
    null,
  );

  function handleSelect(id: string) {
    setSelectedId((prev) => (prev === id ? null : id));
    setPaxMap((prev) => ({
      ...prev,
      [id]: prev[id] ?? { adult: 1, child: 0, infant: 0 },
    }));
  }

  function handleSetPax(id: string, type: keyof Pax, val: number) {
    setPaxMap((prev) => ({
      ...prev,
      [id]: { ...prev[id], [type]: Math.max(0, val) },
    }));
  }

  function handleConfirm() {
    if (!confirmVariant) return;
    const pax = paxMap[confirmVariant.id] ?? { adult: 0, child: 0, infant: 0 };
    onConfirmBooking?.(confirmVariant, pax);
    setConfirmVariant(null);
    setSelectedId(null);
  }

  const confirmPax = confirmVariant
    ? (paxMap[confirmVariant.id] ?? { adult: 0, child: 0, infant: 0 })
    : { adult: 0, child: 0, infant: 0 };

  if (variants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/50 px-4 py-10 text-center">
        <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-muted">
          <CalendarX2 className="size-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">No variants available</p>
        <p className="mt-1 text-xs text-muted-foreground">
          No dates or booking options are available right now.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {variants.map((v) => (
          <VariantCard
            key={v.id}
            variant={v}
            selected={selectedId === v.id}
            pax={paxMap[v.id] ?? { adult: 0, child: 0, infant: 0 }}
            onSelect={() => handleSelect(v.id)}
            onSetPax={(type, val) => handleSetPax(v.id, type, val)}
            onBook={() => setConfirmVariant(v)}
          />
        ))}
      </div>

      {confirmVariant && (
        <BookingConfirmDialog
          open={!!confirmVariant}
          onOpenChange={(open) => !open && setConfirmVariant(null)}
          variant={confirmVariant}
          pax={confirmPax}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
}
