import { ProductsSummary } from "@/lib/admin-types";
import { Box, Bus, Compass, FileText, Pause, Play } from "lucide-react";

export function ProductsOverview({ summary }: { summary: ProductsSummary }) {
  const cards = [
    {
      label: "Total Products",
      value: summary.totalProducts,
      color: "#6366f1",
      icon: <Box className="size-4" />,
    },
    {
      label: "Active",
      value: summary.activeCount,
      color: "#22c55e",
      icon: <Play className="size-4" />,
    },
    {
      label: "Drafts",
      value: summary.draftCount,
      color: "#f59e0b",
      icon: <FileText className="size-4" />,
    },
    {
      label: "Paused",
      value: summary.pausedCount,
      color: "#f97316",
      icon: <Pause className="size-4" />,
    },
    {
      label: "Transport",
      value: summary.transportCount,
      color: "#0ea5e9",
      icon: <Bus className="size-4" />,
    },
    {
      label: "Experiences",
      value: summary.experienceCount,
      color: "#8b5cf6",
      icon: <Compass className="size-4" />,
    },
  ];

  return (
    <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
      {cards.map(({ label, value, color, icon }) => (
        <div
          key={label}
          className="flex items-start gap-3 rounded-md border bg-card p-3"
        >
          <div
            className="rounded-full size-8 grid place-items-center"
            style={{ color, background: `${color}2f` }}
          >
            {icon}
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </p>

            <p
              className="text-2xl font-semibold tabular-nums"
              style={{ color }}
            >
              {value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
