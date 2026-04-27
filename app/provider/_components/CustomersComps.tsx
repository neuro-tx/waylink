"use client";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  ChevronDown,
  ChevronUp,
  Users,
  TrendingUp,
  CircleDollarSign,
  UserX,
  ReceiptText,
} from "lucide-react";
import { cn, fmtDate } from "@/lib/utils";
import type {
  Customer,
  CustomerOrder,
  CustomerSegment,
  CustomerStats,
  CustomerStatus,
} from "@/lib/all-types";

function fmtCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const statusConfig: Record<
  CustomerStatus,
  { label: string; className: string }
> = {
  active: {
    label: "Active",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  },
  blocked: {
    label: "Blocked",
    className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  },
  churned: {
    label: "Churned",
    className: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  },
};

const segmentConfig: Record<
  CustomerSegment,
  { label: string; className: string }
> = {
  new: {
    label: "New",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  },
  returning: {
    label: "Returning",
    className:
      "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400",
  },
  loyal: {
    label: "Loyal",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  },
};

const orderStatusConfig: Record<CustomerOrder["status"], string> = {
  pending:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  completed:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  cancelled: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  expired: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

export function StatsBar({ stats }: { stats: CustomerStats }) {
  const cards = [
    {
      icon: Users,
      label: "Total customers",
      value: stats.total.toLocaleString(),
      sub: `${stats.active} active`,
      color: "text-blue-500",
    },
    {
      icon: TrendingUp,
      label: "Total revenue",
      value: fmtCurrency(stats.totalRevenue),
      sub: "all time",
      color: "text-emerald-500",
    },
    {
      icon: CircleDollarSign,
      label: "Avg. lifetime value",
      value: fmtCurrency(stats.avgLifetimeValue),
      sub: "per customer",
      color: "text-violet-500",
    },
    {
      icon: UserX,
      label: "Blocked / Churned",
      value: `${stats.blocked} / ${stats.churned}`,
      sub: "need attention",
      color: "text-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((c) => (
        <Card key={c.label} className="border bg-card">
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{c.label}</span>
              <c.icon size={20} className={c.color} />
            </div>
            <p className="text-xl font-semibold tracking-tight text-foreground">
              {c.value}
            </p>
            <p className="text-xs text-muted-foreground">{c.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ExpandedOrders({ customer }: { customer: Customer }) {
  if (customer.orders.length === 0) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
        <ReceiptText size={15} />
        No orders found for this customer.
      </div>
    );
  }
  return (
    <div className="rounded-lg border bg-muted/30 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b border-border">
            <TableHead className="text-xs h-8">Order ID</TableHead>
            <TableHead className="text-xs h-8">Product</TableHead>
            <TableHead className="text-xs h-8">Status</TableHead>
            <TableHead className="text-xs h-8 text-right">Amount</TableHead>
            <TableHead className="text-xs h-8">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customer.orders.map((o) => (
            <TableRow
              key={o.id}
              className="hover:bg-muted/50 border-b border-border/50 last:border-0"
            >
              <TableCell className="text-xs text-muted-foreground font-mono py-2">
                #{o.id.slice(-8).toUpperCase()}
              </TableCell>
              <TableCell className="text-xs py-2 max-w-40 truncate">
                {o.productName}
              </TableCell>
              <TableCell className="py-2">
                <span
                  className={cn(
                    "text-[11px] font-medium px-2 py-0.5 rounded-full capitalize",
                    orderStatusConfig[o.status],
                  )}
                >
                  {o.status}
                </span>
              </TableCell>
              <TableCell className="text-xs text-right py-2 font-medium">
                {fmtCurrency(o.totalAmount, o.currency)}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground py-2">
                {fmtDate(o.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function CustomerRow({ customer }: { customer: Customer }) {
  const [expanded, setExpanded] = useState(false);

  const sc = statusConfig[customer.status];
  const seg = segmentConfig[customer.segment];

  return (
    <>
      <TableRow
        className={cn(
          "cursor-pointer transition-colors hover:bg-muted/50",
          expanded && "bg-muted/30",
        )}
        onClick={() => setExpanded((p) => !p)}
      >
        <TableCell className="py-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage
                src={customer.image ?? undefined}
                alt="profile-img"
              />
              <AvatarFallback className="text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                {initials(customer?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{customer.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {customer.email}
              </p>
            </div>
          </div>
        </TableCell>

        <TableCell className="py-3">
          <span
            className={cn(
              "text-xs font-medium px-2.5 py-1 rounded-full",
              sc.className,
            )}
          >
            {sc.label}
          </span>
        </TableCell>

        {/* Segment */}
        <TableCell className="py-3">
          <span
            className={cn(
              "text-[11px] font-medium px-2.5 py-1 rounded-full",
              seg.className,
            )}
          >
            {seg.label}
          </span>
        </TableCell>

        {/* LTV */}
        <TableCell className="py-3 text-sm font-medium">
          {fmtCurrency(customer.lifetimeValue, customer.currency)}
        </TableCell>

        {/* Orders */}
        <TableCell className="py-3">
          <div className="text-sm">{customer.totalOrders}</div>
          <div className="text-xs text-muted-foreground">
            {customer.completedOrders} completed
          </div>
        </TableCell>

        {customer?.lastOrderAt && (
          <TableCell className="py-3 text-xs text-muted-foreground">
            {fmtDate(customer.lastOrderAt)}
          </TableCell>
        )}

        {/* Actions */}
        <TableCell className="py-3" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1 justify-end">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setExpanded((p) => !p)}
            >
              {expanded ? <ChevronUp size={15} /> : <ChevronDown size={14} />}
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {expanded && (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={7} className="py-4 px-4">
            <div className="ml-11">
              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                <ReceiptText size={12} />
                Order history
              </p>
              <ExpandedOrders customer={customer} />
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell className="py-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-36" />
              </div>
            </div>
          </TableCell>
          {[1, 2, 3, 4, 5, 6].map((j) => (
            <TableCell key={j} className="py-3">
              <Skeleton className="h-3 w-16" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
