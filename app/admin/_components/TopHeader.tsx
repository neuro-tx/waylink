"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  BadgeCheck,
  Building2,
  Calendar,
  Car,
  ChevronRight,
  Compass,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { Provider } from "@/lib/all-types";
import { ProviderStats } from "@/lib/panel-types";
import { ProviderOverview } from "@/app/provider/_components/ProviderOverview";
import { initials } from "@/lib/helpers";
import { fmtDate } from "@/lib/utils";
import { StatusBadge } from "./ProviderLayout";

function Avatar({
  name,
  src,
  size = "sm",
}: {
  name: string;
  src: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const hue = (name.charCodeAt(0) * 37 + (name.charCodeAt(1) ?? 0) * 13) % 360;
  const dim =
    size === "lg"
      ? "h-16 w-16 text-lg"
      : size === "md"
        ? "h-10 w-10 text-sm"
        : "h-8 w-8 text-xs";
  if (src)
    return (
      <img
        src={src}
        alt={name}
        className={`${dim} rounded-xl object-cover shrink-0`}
        loading="lazy"
      />
    );
  return (
    <div
      className={`${dim} rounded-xl flex items-center justify-center font-semibold shrink-0 select-none`}
      style={{
        background: `oklch(28% 0.07 ${hue})`,
        color: `oklch(82% 0.14 ${hue})`,
      }}
    >
      {initials(name)}
    </div>
  );
}

export function TopHeader({
  provider,
  stats,
}: {
  provider: Provider;
  stats: ProviderStats | null;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          className="hover:text-foreground transition-colors"
          onClick={() => history.back()}
        >
          Providers
        </button>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium truncate">
          {provider.name}
        </span>
      </div>

      <div className="w-full">
        <ProviderOverview stats={stats} showAlert={false} />
      </div>

      <Card className="overflow-hidden bg-transparent py-0">
        <div
          className="h-24 w-full"
          style={{
            background: provider.cover
              ? `url(${provider.cover}) center/cover`
              : `linear-gradient(135deg, oklch(28% 0.07 ${(provider.name.charCodeAt(0) * 37) % 360}), oklch(22% 0.05 ${(provider.name.charCodeAt(0) * 37 + 60) % 360}))`,
          }}
        />

        <CardContent className="px-6 pb-6 -mt-8">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div className="flex items-end gap-4">
              <div className="ring-4 ring-background rounded-xl">
                <Avatar name={provider.name} src={provider.logo} size="lg" />
              </div>
              <div className="mb-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-semibold tracking-tight">
                    {provider.name}
                  </h1>
                  {provider.isVerified && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <BadgeCheck className="size-4 text-blue-500 shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent>Verified provider</TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={provider.status} />
                  <Badge variant="secondary" className="gap-1.5 text-[11px]">
                    {provider.serviceType === "transport" ? (
                      <Car className="h-3 w-3" />
                    ) : (
                      <Compass className="h-3 w-3" />
                    )}
                    <span className="capitalize">{provider.serviceType}</span>
                  </Badge>
                  <Badge variant="secondary" className="gap-1.5 text-[11px]">
                    <Building2 className="h-3 w-3" />
                    <span className="capitalize">{provider.businessType}</span>
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 grid md:grid-cols-[1fr_auto] gap-6">
            {provider.description && (
              <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
                {provider.description}
              </p>
            )}
            <dl className="space-y-2 text-xs shrink-0">
              {provider.businessEmail && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <a
                    href={`mailto:${provider.businessEmail}`}
                    className="hover:text-foreground transition-colors"
                  >
                    {provider.businessEmail}
                  </a>
                </div>
              )}
              {provider.businessPhone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  <span>{provider.businessPhone}</span>
                </div>
              )}
              {provider.address && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span>{provider.address}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span>Joined {fmtDate(provider.createdAt)}</span>
              </div>
            </dl>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
