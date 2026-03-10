"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Star,
  MapPin,
  Plane,
  Train,
  Bus,
  Anchor,
  Ship,
  Car,
  Navigation,
  Zap,
  Users,
  Compass,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { displayMedia, normalizeLocation } from "@/lib/helpers";
import { ProductCardProps } from "@/lib/all-types";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";

const TRANSPORT_ICON: Record<string, React.ElementType> = {
  flight: Plane,
  train: Train,
  bus: Bus,
  ferry: Anchor,
  cruise: Ship,
  car_rental: Car,
  shuttle: Navigation,
  taxi: Car,
  private_van: Users,
  helicopter: Zap,
};

const TYPE_CONFIG = {
  experience: {
    accent: "#FF6B35",
    label: "Experience",
    icon: Compass,
    href: (slug: string) => `/experiences/${slug}`,
  },
  transport: {
    accent: "#3B9EFF",
    label: "Transport",
    icon: Plane,
    href: (slug: string) => `/transport/${slug}`,
  },
} as const;

function Stars({ rate }: { rate: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "w-3 h-3",
            i < Math.floor(rate)
              ? "fill-amber-400 text-amber-400"
              : "fill-transparent text-amber-400/30",
          )}
        />
      ))}
    </div>
  );
}

function TransportCover({
  product,
  accent,
}: {
  product: ProductCardProps;
  accent: string;
}) {
  const titleLower = product.title.toLowerCase();
  let TransportIcon: React.ElementType = Plane;
  for (const [key, Icon] of Object.entries(TRANSPORT_ICON)) {
    if (
      titleLower.includes(key.replace("_", " ")) ||
      titleLower.includes(key)
    ) {
      TransportIcon = Icon;
      break;
    }
  }

  const { from, to } = normalizeLocation(product.locations);

  return (
    <div
      className="relative h-48 w-full shrink-0 flex flex-col items-center justify-center gap-3 overflow-hidden"
      style={{
        background: `linear-linear(135deg, ${accent}18 0%, ${accent}06 60%, transparent 100%)`,
      }}
    >
      <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none">
        <defs>
          <pattern
            id={`grid-${product.id}`}
            x="0"
            y="0"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${product.id})`} />
      </svg>

      <motion.div
        className="relative flex items-center justify-center w-16 h-16 rounded-2xl border"
        style={{
          background: `linear-linear(135deg, ${accent}28, ${accent}10)`,
          borderColor: `${accent}35`,
        }}
      >
        <TransportIcon className="w-7 h-7" style={{ color: accent }} />
      </motion.div>

      {from && to && from.city !== to.city && (
        <div
          className="flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold"
          style={{
            borderColor: `${accent}30`,
            color: accent,
            background: `${accent}0e`,
          }}
        >
          <span>{from.city}</span>
          <ArrowRight className="w-3 h-3" />
          <span>{to.city}</span>
        </div>
      )}

      <div className="absolute bottom-0 inset-x-0 h-8 bg-linear-to-t from-card to-transparent" />
    </div>
  );
}

export function TopRatedCard({ product }: { product: ProductCardProps }) {
  const config = TYPE_CONFIG[product.type];
  const accent = config.accent;
  const { cover } = displayMedia(product.media);
  const { from, to } = normalizeLocation(product.locations);
  const location = to ?? from;
  const rate = parseFloat(product.avgRate);
  const isTransport = product.type === "transport";

  return (
    <motion.div className="h-full">
      <div
        className="group relative flex flex-col h-full overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-foreground/15 hover:shadow-xl hover:shadow-black/8"
        style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-0.5 z-10"
          style={{
            background: `linear-linear(to right, ${accent}, ${accent}00)`,
          }}
        />

        {isTransport ? (
          <TransportCover product={product} accent={accent} />
        ) : (
          <div className="relative h-48 w-full overflow-hidden shrink-0">
            {cover ? (
              <Image
                src={cover}
                alt={product.title}
                fill
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
            ) : (
              <div
                className="w-full h-full"
                style={{
                  background: `linear-linear(135deg, ${accent}22, ${accent}08)`,
                }}
              />
            )}

            <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/10 to-transparent" />

            {rate > 0 && (
              <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md">
                <Stars rate={rate} />
                <span className="text-white text-xs font-bold tabular-nums">
                  {rate.toFixed(1)}
                </span>
                <span className="text-white/55 text-[10px]">
                  ({product.reviews})
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2.5 p-4 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span
              className="text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide"
              style={{
                color: accent,
                background: `${accent}15`,
                border: `1px solid ${accent}30`,
              }}
            >
              {config.label}
            </span>

            {isTransport && (
              <div className="flex items-center gap-1.5">
                <Stars rate={rate} />
                <span className="text-xs font-bold text-foreground tabular-nums">
                  {rate.toFixed(1)}
                </span>
                <span className="text-muted-foreground text-[10px]">
                  ({product.reviews})
                </span>
              </div>
            )}
          </div>

          <h3 className="font-bold leading-snug text-foreground line-clamp-2 font-georgia">
            {product.title}
          </h3>

          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 flex-1">
            {product.shortDescription}
          </p>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            {location && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">
                  {location.city}, {location.country}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="w-3 h-3 shrink-0" />
              <span>
                <span className="font-semibold text-foreground tabular-nums">
                  {product.bookings >= 1000
                    ? `${(product.bookings / 1000).toFixed(1)}k`
                    : product.bookings}
                </span>{" "}
                bookings
              </span>
            </div>
          </div>

          <Separator className="opacity-60" />

          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2 flex-nowrap">
              <div className="flex items-center gap-2 min-w-0">
                {product.provider.logo ? (
                  <img
                    src={product.provider.logo}
                    alt={product.provider.name}
                    className="size-7 rounded-full object-cover shrink-0 ring-1 ring-border"
                  />
                ) : (
                  <div
                    className="size-7 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0"
                    style={{ background: `${accent}20`, color: accent }}
                  >
                    {product.provider.name[0].toUpperCase()}
                  </div>
                )}
                <div className="flex items-center gap-1 min-w-0 text-sm font-medium text-foreground truncate">
                  {product.provider.name}
                </div>
              </div>

              <div className="text-left shrink-0">
                <span className="text-[10px] text-muted-foreground block leading-none">
                  from
                </span>
                <span className="text-sm font-extrabold text-foreground tabular-nums leading-tight">
                  <span style={{ color: accent }} className="font-semibold">
                    {product.currency}{" "}
                  </span>
                  {parseFloat(product.basePrice)}
                </span>
              </div>
            </div>

            <Button
              className="w-full cursor-pointer capitalize font-semibold transition-all duration-200"
              style={{
                background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                borderColor: `${accent}50`,
                boxShadow: `0 4px 14px ${accent}30`,
                color: "#fff",
              }}
              size="sm"
              asChild
            >
              <Link href={`/products/${product.id}`} as={`${product.slug}`}>
                View details
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
