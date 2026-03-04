"use client";

import { motion } from "framer-motion";
import {
  Users,
  BadgeCheck,
  Star,
  ArrowRight,
  Car,
  Bus,
  Ship,
  Plane,
  Train,
  Navigation,
  Zap,
  Anchor,
} from "lucide-react";
import { Separator } from "./ui/separator";
import {
  Location,
  Transport,
  TransportClass,
  TransportType,
} from "@/lib/all-types";
import { getRouteLocations } from "@/lib/helpers";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { cn } from "@/lib/utils";

const TRANSPORT_CONFIG: Record<
  TransportType,
  { label: string; icon: React.ElementType; accent: string }
> = {
  bus: { label: "Bus", icon: Bus, accent: "#00C9A7" },
  flight: { label: "Flight", icon: Plane, accent: "#3B9EFF" },
  train: { label: "Train", icon: Train, accent: "#845EF7" },
  ferry: { label: "Ferry", icon: Anchor, accent: "#3B9EFF" },
  cruise: { label: "Cruise", icon: Ship, accent: "#845EF7" },
  car_rental: { label: "Car Rental", icon: Car, accent: "#FF6B35" },
  shuttle: { label: "Shuttle", icon: Navigation, accent: "#00C9A7" },
  taxi: { label: "Taxi", icon: Car, accent: "#FF6B35" },
  private_van: { label: "Private Van", icon: Users, accent: "#845EF7" },
  helicopter: { label: "Helicopter", icon: Zap, accent: "#FF6B35" },
};

const CLASS_LABELS: Record<TransportClass, string> = {
  economy: "Economy",
  business: "Business",
  first_class: "First Class",
  premium_economy: "Premium",
  vip: "VIP",
};

const CLASS_ACCENT: Record<TransportClass, string> = {
  economy: "#9b9690",
  premium_economy: "#00C9A7",
  business: "#845EF7",
  first_class: "#FF6B35",
  vip: "#FF6B35",
};

const FILTER_TABS = [
  { label: "All", value: "all" as const },
  ...Object.entries(TRANSPORT_CONFIG).map(([value, { label }]) => ({
    label,
    value: value as TransportType,
  })),
];

export function RouteBadge({
  locations,
  accent,
}: {
  locations: Pick<Location, "city" | "country" | "type" | "id">[];
  accent: string;
}) {
  const { start, end } = getRouteLocations(locations);
  if (!start || !end) return null;
  const sameCity = start.city === end.city;

  return (
    <div className="flex items-center gap-1.5 text-xs font-medium">
      <div className="flex items-center gap-1">
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: accent }}
        />
        <span className="text-muted-foreground">{start.city}</span>
      </div>
      {!sameCity && (
        <>
          <div
            className="flex-1 min-w-5 h-px"
            style={{
              background: `linear-gradient(to right, ${accent}80, ${accent}20)`,
            }}
          />
          <ArrowRight className="w-4 h-4 shrink-0" style={{ color: accent }} />
          <div
            className="flex-1 min-w-5 h-px"
            style={{
              background: `linear-gradient(to right, ${accent}20, ${accent}80)`,
            }}
          />
          <div className="flex items-center gap-1">
            <span
              className="w-1.5 h-1.5 rounded-full border"
              style={{ borderColor: accent }}
            />
            <span className="text-gray-light">{end.city}</span>
          </div>
        </>
      )}
    </div>
  );
}

export function TransportCard({ product }: { product: Transport }) {
  const config = TRANSPORT_CONFIG[product.transportType];
  const accent = config.accent;
  const Icon = config.icon;
  const classLabel = CLASS_LABELS[product.class as TransportClass];
  const classAccent = CLASS_ACCENT[product.class as TransportClass];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col rounded-2xl border box"
      style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.05)" }}
    >
      <div
        className="h-0.5 w-full shrink-0"
        style={{
          background: `linear-gradient(to right, ${accent}, ${accent}00)`,
        }}
      />

      <div
        className="relative px-5 pt-5 pb-5 flex flex-col gap-3"
        style={{
          background: `linear-gradient(135deg, ${accent}0d 0%, transparent 55%)`,
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center border shrink-0"
              style={{
                background: `linear-gradient(135deg, ${accent}22, ${accent}08)`,
                borderColor: `${accent}40`,
                color: accent,
              }}
            >
              <Icon className="w-5 h-5" />
            </div>

            <div className="flex flex-col gap-0.5">
              <span
                className="text-xs font-bold tracking-widest uppercase"
                style={{ color: accent }}
              >
                {config.label}
              </span>

              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-semibold">{product.avgRate}</span>
                <span className="text-xs text-muted-foreground">
                  ({product.reviews})
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-bold"
              style={{ background: `${classAccent}18`, color: classAccent }}
            >
              {classLabel}
            </span>

            {product.provider.isVerified && (
              <motion.div whileHover={{ scale: 1.15 }}>
                <BadgeCheck className="w-4.5 h-4.5 text-blue-10" />
              </motion.div>
            )}
          </div>
        </div>

        <h3
          className="text-base font-bold leading-snug line-clamp-1 text-neutral-800 dark:text-neutral-200"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {product.title}
        </h3>

        <RouteBadge locations={product.locations} accent={accent} />

        <div className="flex items-center gap-2 flex-wrap">
          {product.directroute && (
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-semibold border"
              style={{
                borderColor: `${accent}30`,
                color: accent,
                background: `${accent}0a`,
              }}
            >
              Direct Route
            </span>
          )}
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium border text-muted-foreground">
            {product.provider.name}
          </span>
        </div>
      </div>

      <div className="px-5 pb-5 flex flex-col gap-4 flex-1">
        <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
          {product.shortDescription}
        </p>

        <div className="grid grid-cols-2 gap-2">
          {[
            {
              icon: Users,
              label: "Bookings",
              value: `${product.bookings.toLocaleString()}+`,
            },
            { icon: Star, label: "Reviews", value: `${product.reviews}` },
          ].map(({ icon: StatIcon, label, value }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl p-3 border"
              style={{ background: `${accent}06`, borderColor: `${accent}18` }}
            >
              <StatIcon
                className="w-4 h-4 shrink-0"
                style={{ color: accent }}
              />
              <div>
                <p className="text-[10px] text-muted-foreground leading-none">
                  {label}
                </p>
                <p className="text-xs font-bold leading-none mt-0.5">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        <div className="flex items-end justify-between gap-3">
          <div>
            <span className="text-[10px] text-muted-foreground leading-none block mb-1">
              Starting from
            </span>
            <span
              className="text-2xl font-extrabold tracking-tight text-neutral-800 dark:text-neutral-200"
              style={{ fontFamily: "Georgia, serif" }}
            >
              <span
                className="text-sm font-semibold mr-0.5"
                style={{ color: accent }}
              >
                {product.currency}
              </span>
              {product.basePrice}
            </span>
          </div>

          <motion.div
            whileHover={{ scale: 1.01, boxShadow: `0 8px 20px ${accent}45` }}
            whileTap={{ scale: 0.97 }}
            className="rounded-xl bg-transparent"
          >
            <Link
              href={`/transport/variants/${product.id}`}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white shrink-0 cursor-pointer flex-nowrap whitespace-nowrap"
              style={{
                background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                boxShadow: `0 4px 16px ${accent}30`,
              }}
            >
              show variants
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export function CategoryFilter({
  active,
  onChange,
}: {
  active: TransportType | "all";
  onChange: (v: TransportType | "all") => void;
}) {
  return (
    <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
      {FILTER_TABS.map(({ label, value }) => {
        const isActive = active === value;
        const accent =
          value === "all"
            ? "#845EF7"
            : (TRANSPORT_CONFIG[value as TransportType]?.accent ?? "#845EF7");
        const Icon =
          value === "all"
            ? Car
            : (TRANSPORT_CONFIG[value as TransportType]?.icon ?? Car);

        return (
          <motion.button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all duration-200 cursor-pointer"
            style={{
              background: isActive ? `${accent}18` : "transparent",
              borderColor: isActive ? `${accent}60` : undefined,
              color: isActive ? accent : undefined,
            }}
          >
            <Icon className="w-3.5 h-3.5" style={{ color: accent }} />
            {label}
          </motion.button>
        );
      })}
    </div>
  );
}

export function TypeFilterStrip({
  active,
  onChange,
  className,
}: {
  active: TransportType | "all";
  className: string;
  onChange: (v: TransportType | "all") => void;
}) {
  return (
    <Select
      value={active}
      onValueChange={(v) => onChange(v as TransportType | "all")}
    >
      <SelectTrigger className={cn("w-full max-w-48 inline-flex", className)}>
        <div className="flex items-center gap-1.5">
          <SelectValue placeholder="All types" />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {FILTER_TABS.map((tab) => {
            const config =
              tab.value === "all"
                ? null
                : TRANSPORT_CONFIG[tab.value as TransportType];

            const Icon = config?.icon ?? Car;
            const accent = config?.accent ?? "#845EF7";

            return (
              <SelectItem key={tab.value} value={tab.value}>
                <div className="flex items-center gap-2">
                  <Icon
                    className="w-3.5 h-3.5 shrink-0"
                    style={{ color: accent }}
                  />
                  {tab.label}
                </div>
              </SelectItem>
            );
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
