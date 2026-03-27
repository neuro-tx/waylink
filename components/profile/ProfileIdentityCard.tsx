"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  CalendarDays,
  Clock,
  Fingerprint,
  Mail,
  ShieldCheck,
  ShieldOff,
  Layers,
  AlertCircle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/lib/all-types";
import { fmtDate } from "@/lib/utils";
import { Separator } from "../ui/separator";

function fmtDateShort(iso: string | Date) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface ProfileIdentityCardProps {
  user: User;
}

export function ProfileIdentityCard({ user }: ProfileIdentityCardProps) {
  const initials = useMemo(
    () =>
      user.name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    [user.name],
  );

  const isActive = !user.banned;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl border border-border/50 bg-card"
    >
      <div className="absolute left-0 top-0 h-full w-1 bg-linear-to-b from-amber-400 via-amber-500 to-amber-600 opacity-80" />

      <div
        className="pointer-events-none absolute inset-0 opacity-1"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg,transparent,transparent 23px,currentColor 23px,currentColor 24px),repeating-linear-gradient(90deg,transparent,transparent 23px,currentColor 23px,currentColor 24px)",
        }}
      />

      <div className="relative px-7 py-6 pl-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-7">
          <div className="relative shrink-0">
            <Avatar className="h-20 w-20 border-2 border-border/50 shadow-sm ring-4 ring-background md:h-24 md:w-24">
              <AvatarImage
                src={user.image ?? undefined}
                alt={user.name}
                className="object-cover"
              />
              <AvatarFallback className="text-xl font-semibold tracking-tight">
                {initials}
              </AvatarFallback>
            </Avatar>

            <span className="absolute bottom-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-background bg-card">
              <span
                className={`h-2 w-2 rounded-full ${
                  isActive ? "bg-emerald-500" : "bg-rose-500"
                }`}
              />
            </span>
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
                {user.name}
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {user.email}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium capitalize text-amber-700 dark:text-amber-400">
                <Layers className="h-3 w-3" />
                {user.role ?? "user"}
              </span>

              {user.emailVerified ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  <BadgeCheck className="h-3 w-3" />
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                  <AlertCircle className="h-3 w-3" />
                  Unverified
                </span>
              )}

              {isActive ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck className="h-3 w-3" />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-700 dark:text-rose-400">
                  <ShieldOff className="h-3 w-3" />
                  Restricted
                  {user.banReason ? ` — ${user.banReason}` : ""}
                </span>
              )}
            </div>
          </div>
        </div>

        <Separator className="my-5" />

        <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          <CredentialField
            icon={<Mail className="h-3.5 w-3.5" />}
            label="Email address"
            value={user.email}
            mono
          />
          <CredentialField
            icon={<Fingerprint className="h-3.5 w-3.5" />}
            label="User ID"
            value={user.id}
            mono
            truncate
          />
          <CredentialField
            icon={<CalendarDays className="h-3.5 w-3.5" />}
            label="Member since"
            value={fmtDate(user.createdAt)}
          />
          <CredentialField
            icon={<Clock className="h-3.5 w-3.5" />}
            label="Last updated"
            value={fmtDateShort(user.updatedAt)}
          />
        </dl>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-border/40 pt-4">
          <StatusDot
            active={isActive}
            label={isActive ? "Account active" : "Account restricted"}
          />
          <StatusDot
            active={user.emailVerified}
            label={user.emailVerified ? "Email verified" : "Email not verified"}
          />
          <StatusDot active label="Sessions managed separately" />
        </div>
      </div>
    </motion.div>
  );
}

function CredentialField({
  icon,
  label,
  value,
  mono = false,
  truncate = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
  truncate?: boolean;
}) {
  return (
    <div className="space-y-1">
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="opacity-60">{icon}</span>
        {label}
      </dt>
      <dd
        className={`text-sm font-medium leading-snug ${
          mono ? "font-mono text-xs tracking-tight" : ""
        } ${truncate ? "truncate" : ""}`}
        title={truncate ? value : undefined}
      >
        {value}
      </dd>
    </div>
  );
}

function StatusDot({ active, label }: { active: boolean; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-emerald-500" : "bg-rose-500"
        }`}
      />
      {label}
    </span>
  );
}
