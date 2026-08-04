"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, useReducedMotion, animate } from "motion/react";
import { PieChart, Pie, Cell } from "recharts";
import {
  Shield,
  Store,
  Users,
  Ban,
  Clock,
  ShieldOff,
  LucideIcon,
} from "lucide-react";
import { UserStatsData } from "@/lib/admin-types";

const COLORS = {
  admin: "#a78bfa",
  provider: "#f59e0b",
  member: "#34d399",
  active: "#2dd4bf",
  banned: "#fb7185",
  permanent: "#f43f5e",
  temporary: "#fbbf24",
  track: "rgba(148,163,184,0.12)",
} as const;

function useCountUp(
  target: number,
  duration = 1.1,
  shouldReduceMotion?: boolean | null,
) {
  const [value, setValue] = useState(shouldReduceMotion ? target : 0);

  useEffect(() => {
    if (shouldReduceMotion) {
      setValue(target);
      return;
    }
    const controls = animate(0, target, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setValue(Math.round(v)),
    });

    return () => controls.stop();
  }, [target]);

  return value;
}

interface SegmentProps {
  label: string;
  value: number;
  pct: number;
  color: string;
  icon: LucideIcon;
  delay: number;
  reduceMotion?: boolean | null;
}

function Segment({
  label,
  value,
  pct,
  color,
  icon: Icon,
  delay,
  reduceMotion,
}: SegmentProps) {
  return (
    <motion.div
      className="min-w-0 flex-1"
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon size={18} style={{ color }} />
        <span className="text-sm font-medium tracking-wide">{label}</span>
      </div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="text-lg font-semibold tabular-nums">
          {value.toLocaleString()}
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {pct}%
        </span>
      </div>
    </motion.div>
  );
}

interface DonutSegment {
  label: string;
  value: number;
  color: string;
  pct: number;
}

interface DonutProps {
  title: string;
  segments: DonutSegment[];
  centerLabel: string;
  centerValue: string;
  size?: number;
}

function Donut({
  title,
  segments,
  centerLabel,
  centerValue,
  size = 132,
}: DonutProps) {
  const chartData = segments.map((s) => ({
    name: s.label,
    value: s.value,
    color: s.color,
  }));
  const hasData = segments.some((s) => s.value > 0);
  const pieData = hasData
    ? chartData
    : [{ name: "empty", value: 1, color: COLORS.track }];

  return (
    <div className="flex flex-1 items-center gap-4">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <PieChart width={size} height={size}>
          <Pie
            data={pieData}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius={size * 0.34}
            outerRadius={size * 0.48}
            paddingAngle={hasData ? 3 : 0}
            stroke="none"
            isAnimationActive
            animationDuration={900}
            animationEasing="ease-out"
          >
            {pieData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-semibold tabular-nums">
            {centerValue}
          </span>
          <span className="text-xs text-muted-foreground capitalize">
            {centerLabel}
          </span>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-2.5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </p>
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{
                backgroundColor: s.color,
                boxShadow: `0 0 8px ${s.color}66`,
              }}
            />
            <span className="text-xs text-muted-foreground">{s.label}</span>
            <span className="text-xs font-medium tabular-nums">
              {s.value.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground tabular-nums">
              ({s.pct}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function UserStatsOverview({
  data,
}: {
  data: UserStatsData | null;
}) {
  const reduceMotion = useReducedMotion();

  if (!data) return <UserStatsEmptyIllustration />;

  const total = Math.max(data.total, 1);

  const members = Math.max(total - data.admins - data.providers, 0);

  const pct = (n: number) => Math.round((n / total) * 1000) / 10;

  const composition = useMemo(
    () => [
      {
        key: "admin",
        label: "Admins",
        value: data.admins,
        color: COLORS.admin,
        icon: Shield,
      },
      {
        key: "provider",
        label: "Providers",
        value: data.providers,
        color: COLORS.provider,
        icon: Store,
      },
      {
        key: "member",
        label: "Members",
        value: members,
        color: COLORS.member,
        icon: Users,
      },
    ],
    [data.admins, data.providers, members],
  );

  const totalCount = useCountUp(data.total, 1.1, reduceMotion);

  const statusSegments: DonutSegment[] = [
    {
      label: "Active",
      value: data.activeCount,
      color: COLORS.active,
      pct: pct(data.activeCount),
    },
    {
      label: "Banned",
      value: data.bannedCount,
      color: COLORS.banned,
      pct: pct(data.bannedCount),
    },
  ];

  const banSegments: DonutSegment[] = [
    {
      label: "Permanent",
      value: data.permanentBans,
      color: COLORS.permanent,
      pct: data.bannedCount
        ? Math.round((data.permanentBans / data.bannedCount) * 1000) / 10
        : 0,
    },
    {
      label: "Temporary",
      value: data.temporaryBans,
      color: COLORS.temporary,
      pct: data.bannedCount
        ? Math.round((data.temporaryBans / data.bannedCount) * 1000) / 10
        : 0,
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-lg border p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full blur-3xl bg-radial from-[rgba(167,139,250,0.17)] to-transparent"
      />

      <div className="space-y-6">
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-base font-semibold uppercase text-muted-foreground">
              User base
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-4xl font-semibold tracking-tight tabular-nums">
                {totalCount.toLocaleString()}
              </span>
              <span className="text-sm text-gray-light">Total Accounts</span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border bg-accent px-3 py-1.5">
            <span
              className="size-1.75 rounded-full"
              style={{
                backgroundColor: COLORS.active,
                boxShadow: `0 0 6px ${COLORS.active}`,
              }}
            />
            <span className="text-xs">{pct(data.activeCount)}% active</span>
          </div>
        </div>

        <div className="relative">
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-accent">
            {composition.map((seg, i) => {
              const width = total ? (seg.value / total) * 100 : 0;
              return (
                <motion.div
                  key={seg.key}
                  className="h-full first:rounded-l-full last:rounded-r-full"
                  style={{ backgroundColor: seg.color }}
                  initial={reduceMotion ? false : { width: 0 }}
                  animate={{ width: `${width}%` }}
                  transition={{
                    duration: 0.9,
                    delay: 0.15 + i * 0.05,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                />
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-4">
            {composition.map((seg, i) => (
              <Segment
                key={seg.key}
                label={seg.label}
                value={seg.value}
                pct={pct(seg.value)}
                color={seg.color}
                icon={seg.icon}
                delay={0.25 + i * 0.06}
                reduceMotion={reduceMotion}
              />
            ))}
          </div>
        </div>

        <div className="h-px w-full bg-linear-to-r from-transparent via-accent to-transparent" />

        <div className="relative flex flex-col gap-6 md:flex-row">
          <Donut
            title="Account status"
            segments={statusSegments}
            centerLabel="active"
            centerValue={`${pct(data.activeCount)}%`}
          />

          {data.bannedCount > 0 ? (
            <Donut
              title="Ban type"
              segments={banSegments}
              centerLabel="banned"
              centerValue={data.bannedCount.toLocaleString()}
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-4 text-muted-foreground">
              <ShieldOff className="size-5" />
              <p className="text-sm">No banned accounts right now.</p>
            </div>
          )}
        </div>

        <div className="relative flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
            <Ban className="size-3.5" style={{ color: COLORS.permanent }} />
            {data.permanentBans.toLocaleString()} permanent
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
            <Clock className="size-3.5" style={{ color: COLORS.temporary }} />
            {data.temporaryBans.toLocaleString()} temporary
          </span>
        </div>
      </div>
    </div>
  );
}

function UserStatsEmptyIllustration() {
  return (
    <div className="flex min-h-100 flex-col items-center justify-center rounded-lg border border-dashed bg-linear-to-b from-muted/40 via-background to-background px-6 text-center">
      <svg
        viewBox="0 0 220 170"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-35 w-52"
      >
        <defs>
          <linearGradient id="users-gradient" x1="40" y1="35" x2="180" y2="130">
            <stop offset="0%" stopColor="#A78BFA" />
            <stop offset="55%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>
        </defs>

        <rect
          x="30"
          y="25"
          width="160"
          height="110"
          rx="18"
          className="fill-muted stroke-border"
          strokeWidth="1.5"
        />

        <rect
          x="48"
          y="42"
          width="54"
          height="8"
          rx="4"
          className="fill-muted-foreground/15"
        />

        <circle
          cx="110"
          cy="78"
          r="20"
          stroke="url(#users-gradient)"
          strokeWidth="4"
        />

        <circle cx="110" cy="72" r="6" fill="url(#users-gradient)" />

        <path
          d="M98 91C101 84 107 81 110 81C113 81 119 84 122 91"
          stroke="url(#users-gradient)"
          strokeWidth="4"
          strokeLinecap="round"
        />

        <circle cx="72" cy="84" r="10" className="fill-muted-foreground/15" />
        <circle cx="148" cy="84" r="10" className="fill-muted-foreground/15" />

        <rect
          x="60"
          y="113"
          width="20"
          height="6"
          rx="3"
          fill="#A78BFA"
          opacity=".9"
        />

        <rect
          x="88"
          y="113"
          width="44"
          height="6"
          rx="3"
          fill="#60A5FA"
          opacity=".9"
        />

        <rect
          x="140"
          y="113"
          width="18"
          height="6"
          rx="3"
          fill="#34D399"
          opacity=".9"
        />

        <path
          d="M22 52L25 46L28 52L34 55L28 58L25 64L22 58L16 55L22 52Z"
          fill="#A78BFA"
        />

        <path
          d="M185 30L187 26L189 30L193 32L189 34L187 38L185 34L181 32L185 30Z"
          fill="#F59E0B"
        />

        <circle cx="180" cy="125" r="4" fill="#34D399" opacity=".85" />
        <circle cx="40" cy="130" r="3" fill="#60A5FA" opacity=".8" />
      </svg>

      <h3 className="text-lg font-semibold tracking-tight">
        No user statistics yet
      </h3>

      <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
        User analytics will appear here once your platform starts collecting
        account activity and registration data.
      </p>
    </div>
  );
}
