"use client";

import { motion } from "framer-motion";
import {
  CheckSquare,
  Square,
  Star,
  MoreHorizontal,
  Trash2,
  Edit2,
  ToggleLeft,
  ToggleRight,
  MapPin,
  Users,
  Pencil,
  Navigation,
  Compass,
} from "lucide-react";
import { useSelect } from "@/hooks/useSelect";
import { Media, Product } from "@/lib/all-types";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { displayMedia, initials, normalizeLocation } from "@/lib/helpers";
import Image from "next/image";
import { useProviderContext } from "@/components/providers/ProviderContext";
import { Separator } from "@/components/ui/separator";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { RouteBadge } from "@/components/Transport";

export interface ProductProps extends Product {
  reviews: number;
  bookings: number;
  avgRate: string;
  revenue: string;
}

type ProductStatus = "active" | "draft" | "paused" | "archived";

const STATUS_CONFIG: Record<
  ProductStatus,
  { label: string; color: string; dot: string }
> = {
  active: {
    label: "Active",
    color:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400  dark:border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  draft: {
    label: "Draft",
    color:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
    dot: "bg-blue-500",
  },
  paused: {
    label: "Paused",
    color:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
    dot: "bg-amber-500",
  },
  archived: {
    label: "Archived",
    color:
      "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800/50 dark:text-zinc-400 dark:border-zinc-700",
    dot: "bg-zinc-500",
  },
};

type ServiceSwitchProps = {
  type: "transport" | "experience";
  status: "active" | "draft" | "paused" | "archived";
  onToggleStatus: (checked: boolean) => void;
};

export function ServiceSwitch({
  type,
  status,
  onToggleStatus,
}: ServiceSwitchProps) {
  if (status !== "active" && status !== "paused") return null;
  const isChecked = status === "active";

  const switchColor =
    type === "transport"
      ? "data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-blue-400 focus-visible:ring-blue-600/20 dark:focus-visible:ring-blue-400/40"
      : "data-[state=checked]:bg-orange-600 dark:data-[state=checked]:bg-orange-400 focus-visible:ring-orange-600/20 dark:focus-visible:ring-orange-400/40";

  return (
    <SwitchPrimitives.Root
      checked={isChecked}
      onCheckedChange={onToggleStatus}
      className={cn(
        "peer bg-border inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        switchColor,
      )}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none block size-4 rounded-full bg-background shadow-lg ring-0 transition-transform",
          "translate-x-5 data-[state=checked]:translate-x-0",
        )}
      />
    </SwitchPrimitives.Root>
  );
}

function StatusBadge({ status }: { status: ProductStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border",
        cfg.color,
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

export function ServiceListRow({
  service,
  selected,
  onSelect,
  onToggleStatus,
}: {
  service: ProductProps;
  selected: boolean;
  onSelect: () => void;
  onToggleStatus: () => void;
}) {
  const { config } = useProviderContext();
  const { cover } = displayMedia(service.media);
  const type = service.type;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      transition={{ duration: 0.18 }}
      className={cn(
        "flex items-center gap-4 px-4 py-3 rounded-xl border transition-colors duration-200 group",
        "bg-muted/50 border-border/50 hover:border-border",
      )}
      style={{
        borderColor: selected ? config.themeColor + "60" : undefined,
      }}
    >
      <button
        onClick={onSelect}
        className="shrink-0 w-5 h-5 rounded flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors"
      >
        {selected ? (
          <CheckSquare className={cn("size-4", config.twTextColor)} />
        ) : (
          <Square className="size-4" />
        )}
      </button>

      <div
        className="shrink-0 size-10 rounded-xl overflow-hidden hidden md:flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #FF6B3518, #FF6B3506)" }}
      >
        {cover ? (
          <Image
            src={cover}
            alt={service.title}
            width={48}
            height={48}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className={cn(
              "w-full h-full flex items-center justify-center text-white text-base font-bold",
              config.twBgColor,
            )}
          >
            {initials(service.title)}
          </div>
        )}
      </div>

      {/* Name & Desc */}
      <div className="flex-2 min-w-0">
        <div className="flex items-center gap-1.5">
          <h3 className="text-base font-bold truncate font-georgia">
            {service.title}
          </h3>
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {service.shortDescription}
        </p>
      </div>

      {/* Status */}
      <div className="shrink-0 hidden sm:block">
        <StatusBadge status={service.status} />
      </div>

      {/* Price */}
      <div className="shrink-0 hidden md:block">
        <span className="text-xs text-muted-foreground block">Price</span>
        <div className="flex items-baseline gap-0.5 justify-end">
          <span className={cn("text-xs font-semibold", config.twTextColor)}>
            {service.currency}
          </span>
          <span className="text-sm font-bold">{service.basePrice}</span>
        </div>
      </div>

      {/* Bookings */}
      <div className="shrink-0 hidden lg:block w-20">
        <span className="text-xs text-muted-foreground block">Bookings</span>
        <span className="text-sm font-semibold">{service.bookings}</span>
      </div>

      {/* Revenue */}
      <div className="shrink-0 hidden lg:block w-24">
        <span className="text-xs text-muted-foreground block">Revenue</span>
        <span className="text-sm font-semibold">
          ${service.revenue.toLocaleString()}
        </span>
      </div>

      {/* Rating */}
      {service.reviews > 0 && (
        <div className="shrink-0 hidden xl:flex items-center gap-1">
          <Star className="size-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm text-muted-foreground">
            {service.avgRate}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="shrink-0 flex items-center gap-2">
        <motion.button
          whileTap={{ scale: 0.98 }}
          className="px-4 py-1.5 rounded-md text-xs font-semibold cursor-pointer border transition-all duration-200 hidden md:block"
          style={{
            color: config.themeColor,
            borderColor: `${config.themeColor}40`,
            background: `${config.themeColor}08`,
          }}
        >
          Edit
        </motion.button>

        <ServiceSwitch
          type={type}
          status={service.status}
          onToggleStatus={onToggleStatus}
        />

        {service.status !== "archived" && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-7 h-7 hover:bg-muted cursor-pointer rounded-sm flex items-center justify-center transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {}}
                className="gap-2 text-sm cursor-pointer md:hidden"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {}}
                className="gap-2 text-sm cursor-pointer text-red-500! hover:bg-red-500/10!"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </motion.div>
  );
}

export function ServiceGridCard({
  service,
  selected,
  onSelect,
  onDelete,
  onEdit,
  onToggleStatus,
}: {
  service: ProductProps;
  selected: boolean;
  onSelect: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const { config } = useProviderContext();
  const { to } = normalizeLocation(service.locations);
  const { handlePointerDown, handlePointerUp, handleClick } = useSelect({
    onSelect,
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.18 }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onClick={handleClick}
      className={cn(
        "group relative overflow-hidden rounded-xl border cursor-pointer",
        "bg-card/50 border-border",
        "transition-all duration-300",
      )}
      style={{
        borderColor: selected ? config.themeColor : undefined,
      }}
    >
      <TopHeader service={service} />

      <div className="p-4 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate text-[15px] font-semibold leading-tight">
            {service.title}
          </h3>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-center text-muted-foreground hover:text-foreground transition">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="bg-popover text-popover-foreground border border-border shadow-lg"
            >
              <DropdownMenuItem
                onClick={onEdit}
                className="gap-2 cursor-pointer"
              >
                <Edit2 className="w-4 h-4" /> Edit
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={onToggleStatus}
                className="gap-2 cursor-pointer"
              >
                {service.status === "active" ? (
                  <>
                    <ToggleLeft className="w-4 h-4" /> Deactivate
                  </>
                ) : (
                  <>
                    <ToggleRight className="w-4 h-4" /> Activate
                  </>
                )}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={onDelete}
                className="gap-2 text-destructive focus:text-destructive cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {service.shortDescription}
        </p>

        {/* Meta Row */}
        <div className="flex items-center justify-between">
          {service.type === "experience" && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3.5 opacity-70" />
              <span className="truncate max-w-24">
                {to?.city}, {to?.country}
              </span>
            </div>
          )}

          {/* Bookings Chip */}
          <div
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition",
              service.bookings > 0
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground",
            )}
          >
            <Users className="size-3.5" />
            {service.bookings > 0 ? `${service.bookings}+` : "0"}
          </div>
        </div>

        <Separator />

        {/* Footer */}
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs text-muted-foreground">Starting from</span>
            <div className="flex items-baseline gap-1">
              <span className={cn("text-xs font-medium", config.twTextColor)}>
                {service.currency}
              </span>
              <span className="text-lg font-semibold">{service.basePrice}</span>
            </div>
          </div>

          {/* CTA */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200"
            style={{
              color: config.themeColor,
              borderColor: `${config.themeColor}50`,
              background: `${config.themeColor}10`,
            }}
          >
            Edit
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function TopHeader({ service }: { service: ProductProps }) {
  return (
    <div className="w-full relative">
      <div className="relative h-44 w-full overflow-hidden">
        <CoverPlaceholder type={service.type} media={service.media} />

        {service.reviews > 0 && (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-[11px] text-white backdrop-blur">
            <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
            <span>{service.avgRate}</span>
            <span className="text-muted-foreground">({service.reviews})</span>
          </div>
        )}

        <div className="absolute left-3 top-3">
          <StatusBadge status={service.status} />
        </div>
      </div>

      {service.type === "transport" && (
        <div className="absolute z-10 bottom-0 w-full p-4 flex flex-col gap-4">
          <RouteBadge locations={service.locations} accent="#3b82f6" />
        </div>
      )}
    </div>
  );
}

function CoverPlaceholder({
  type,
  media,
}: {
  type: ProductProps["type"];
  media: Media[];
}) {
  const { cover } = displayMedia(media);

  if (cover) {
    return (
      <Image
        src={cover}
        alt={type}
        width={200}
        height={200}
        className="w-full h-full object-cover"
      />
    );
  }

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-2"
      style={{
        background:
          type === "transport"
            ? "linear-gradient(135deg, #3B82F618, #3B82F606)"
            : "linear-gradient(135deg, #FF6B3518, #FF6B3506)",
      }}
    >
      {type === "transport" ? (
        <Navigation className="w-8 h-8 text-blue-500 dark:text-blue-400/40" />
      ) : (
        <Compass className="w-8 h-8 text-orange-500 dark:text-orange-400/40" />
      )}
    </div>
  );
}
