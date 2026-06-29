"use client";

import { StatusItem, StatusType } from "@/lib/panel-types";
import { ChartPie } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const STATUS_CFG: Record<
  StatusType,
  { label: string; color: string; track: string; accent: string }
> = {
  active: {
    label: "Active",
    color: "#1baf7a",
    track: "rgba(27,175,122,0.12)",
    accent: "rgba(27,175,122,0.08)",
  },
  paused: {
    label: "Paused",
    color: "#eda100",
    track: "rgba(237,161,0,0.12)",
    accent: "rgba(237,161,0,0.08)",
  },
  draft: {
    label: "Draft",
    color: "#2a78d6",
    track: "rgba(42,120,214,0.12)",
    accent: "rgba(42,120,214,0.08)",
  },
  archived: {
    label: "Archived",
    color: "#888780",
    track: "rgba(136,135,128,0.12)",
    accent: "rgba(136,135,128,0.08)",
  },
};

const ORDER: StatusType[] = ["active", "paused", "draft", "archived"];

interface Segment {
  item: StatusItem;
  start: number;
  end: number;
}

function buildSegments(data: StatusItem[]): Segment[] {
  const TAU = Math.PI * 2;
  const gap = 0.03;
  let angle = -Math.PI / 2;
  return data.map((item) => {
    const sweep = (item.percentage / 100) * TAU - gap;
    const seg = { item, start: angle, end: angle + sweep };
    angle += sweep + gap;
    return seg;
  });
}

function DonutCanvas({
  data,
  total,
  hovered,
  onHover,
  onLeave,
}: {
  data: StatusItem[];
  total: number;
  hovered: StatusType | null;
  onHover: (s: StatusType, e: React.MouseEvent) => void;
  onLeave: () => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const segments = buildSegments(data);
  const CX = 90,
    CY = 90,
    R = 72,
    INNER = 48;
  const TAU = Math.PI * 2;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, 180, 180);
    segments.forEach((seg) => {
      const cfg = STATUS_CFG[seg.item.status];
      const isHov = hovered === seg.item.status;
      const rOuter = isHov ? R + 6 : R;

      ctx.beginPath();
      ctx.moveTo(
        CX + INNER * Math.cos(seg.start),
        CY + INNER * Math.sin(seg.start),
      );
      ctx.arc(CX, CY, rOuter, seg.start, seg.end);
      ctx.arc(CX, CY, INNER, seg.end, seg.start, true);
      ctx.closePath();
      ctx.fillStyle = cfg.color;
      ctx.globalAlpha = isHov ? 1 : hovered ? 0.55 : 0.88;
      ctx.fill();
      ctx.globalAlpha = 1;
    });
  }, [data, hovered]);

  function hitTest(e: React.MouseEvent<HTMLCanvasElement>): StatusType | null {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left - CX;
    const my = e.clientY - rect.top - CY;
    const dist = Math.sqrt(mx * mx + my * my);
    if (dist < INNER || dist > R + 10) return null;
    let angle = Math.atan2(my, mx);
    if (angle < -Math.PI / 2) angle += TAU;
    const norm = angle + Math.PI / 2;
    const seg = segments.find(
      (s) => norm >= s.start + Math.PI / 2 && norm <= s.end + Math.PI / 2,
    );
    return seg?.item.status ?? null;
  }

  return (
    <div className="relative flex items-center justify-center">
      <canvas
        ref={ref}
        width={180}
        height={180}
        className="cursor-default"
        onMouseMove={(e) => {
          const s = hitTest(e);
          if (s) onHover(s, e);
          else onLeave();
        }}
        onMouseLeave={onLeave}
        aria-label="Donut chart showing service status breakdown"
        role="img"
      />
      {/* Centre label */}
      <div className="pointer-events-none absolute text-center">
        <p
          className="text-2xl font-medium leading-none tabular-nums"
          style={{ color: "var(--text-primary)" }}
        >
          {total}
        </p>
        <p className="mt-1 text-[11px]" style={{ color: "var(--text-muted)" }}>
          services
        </p>
      </div>
    </div>
  );
}

function BarRow({
  item,
  hovered,
  onHover,
  onLeave,
}: {
  item: StatusItem;
  hovered: StatusType | null;
  onHover: (s: StatusType, e: React.MouseEvent) => void;
  onLeave: () => void;
}) {
  const cfg = STATUS_CFG[item.status];
  const dim = hovered && hovered !== item.status;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="space-y-1.5 cursor-default transition-opacity duration-200"
      style={{ opacity: dim ? 0.4 : 1 }}
      onMouseMove={(e) => onHover(item.status, e)}
      onMouseLeave={onLeave}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <span
            className="h-2 w-2 rounded-full shrink-0"
            style={{ background: cfg.color }}
          />
          {cfg.label}
        </div>
        <div className="text-xs tabular-nums">
          {item.count}
          <span className="ml-1.5 text-muted-foreground">
            {item.percentage.toFixed(1)}%
          </span>
        </div>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full"
        style={{ background: cfg.track }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: mounted ? `${item.percentage}%` : "0%",
            background: cfg.color,
            transition: "width .65s cubic-bezier(.4,0,.2,1)",
          }}
        />
      </div>
    </div>
  );
}

export function ServiceStatusChart({ data }: { data: StatusItem[] }) {
  const [hovered, setHovered] = useState<StatusType | null>(null);

  const sorted = ORDER.map((s) => data.find((d) => d.status === s)).filter(
    Boolean,
  ) as StatusItem[];
  const total = data.reduce((s, d) => +s + +d.count, 0);

  function handleHover(status: StatusType, e: React.MouseEvent) {
    setHovered(status);
  }
  function handleMove(e: React.MouseEvent) {}
  function handleLeave() {
    setHovered(null);
  }

  return (
    <div className="rounded-lg border overflow-hidden" onMouseMove={handleMove}>
      <div className="px-3 py-4 border-b">
        <h3 className="text-sm font-semibold">
          <div className="flex items-center gap-2">
            <div className="size-7 grid place-items-center bg-emerald-500/10 rounded-md">
              <ChartPie className="size-4 text-emerald-500" />
            </div>
            Service status
          </div>
        </h3>
        <p className="text-xs mt-1 text-muted-foreground">
          Distribution across {total} provider listings
        </p>
      </div>

      <div className="p-5 space-y-5">
        <div className="grid grid-cols-[1fr_180px] gap-6 items-center">
          <div className="space-y-3.5">
            {sorted.map((item) => (
              <BarRow
                key={item.status}
                item={item}
                hovered={hovered}
                onHover={handleHover}
                onLeave={handleLeave}
              />
            ))}
          </div>

          <DonutCanvas
            data={sorted}
            total={total}
            hovered={hovered}
            onHover={handleHover}
            onLeave={handleLeave}
          />
        </div>

        <div className="flex items-center gap-4 flex-wrap pt-1 border-t">
          {sorted.map((item) => {
            const cfg = STATUS_CFG[item.status];
            return (
              <div
                key={item.status}
                className="flex items-center gap-1.5 text-[11px] cursor-default"
              >
                <span
                  className="h-2 w-2 rounded-sm shrink-0"
                  style={{ background: cfg.color }}
                />
                {cfg.label}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
