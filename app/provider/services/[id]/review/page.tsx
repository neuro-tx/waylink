"use client";

import {
  Clock,
  Shield,
  Users,
  Zap,
  Route,
  Bus,
  Sparkles,
  Globe,
  Pencil,
  Layers3,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  DIFFICULTY_CONFIG,
  ExperienceDetails,
  MediaGallery,
  PreviewSkeleton,
  SetupProgressCard,
  TransportDetails,
} from "@/app/provider/_components/PreviewLayout";
import { fmtCurrency } from "@/lib/helpers";
import { PreviewService } from "@/lib/panel-types";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { previewService } from "@/actions/service.action";
import { VariantsPricingSheet } from "@/app/provider/_components/VariantsPricingSheet";

const STATUS_CONFIG = {
  active: {
    label: "Active",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800",
  },
  paused: {
    label: "Paused",
    className:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400",
  },
  draft: {
    label: "Draft",
    className: "bg-muted text-muted-foreground border-border",
  },
  archived: {
    label: "Archived",
    className:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400",
  },
};

function formatDuration(count: number, unit: string) {
  return `${count} ${count === 1 ? unit.replace(/s$/, "") : unit}`;
}

export default function ServicePreview() {
  const params = useParams();
  const searchParams = useSearchParams();
  const serviceId = params.id as string;
  const isSheetOpen = searchParams.get("sheet") === "open";

  const router = useRouter();

  const [service, setService] = useState<PreviewService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    async function loadService() {
      if (!serviceId) {
        setError("Service id is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await previewService(serviceId);
        if (!response.success || !response.data) {
          const message = response.error || "Unable to load service";

          setError(message);
          return;
        }

        setService(response.data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong";

        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadService();
  }, [serviceId, retryKey]);

  function openSheet() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sheet", "open");
    router.push(`?${params.toString()}`, { scroll: false });
  }

  function closeSheet() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("sheet");
    const query = params.toString();
    router.push(query ? `?${query}` : "?", { scroll: false });
  }

  const sheetOpen = isSheetOpen;

  if (loading) {
    return <PreviewSkeleton />;
  }

  if (error || !service) {
    return (
      <div className="flex min-h-120 items-center justify-center px-4">
        <div className="flex flex-col items-center text-center">
          <div className="mb-5 flex size-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="size-7 text-destructive" />
          </div>

          <p className="text-lg font-semibold tracking-tight text-foreground">
            Failed to load service
          </p>

          <p className="mt-2 text-sm leading-relaxed text-destructive">
            {error}
          </p>

          <div className="mt-3 flex items-center gap-3">
            <Button
              onClick={() => setRetryKey((p) => p + 1)}
              className="min-w-28"
              variant="outline"
              size="sm"
            >
              Try again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[service.status];
  const isExperience = service.type === "experience";

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
          <div className="space-y-7 min-w-0">
            <SetupProgressCard
              setup={{
                hasLocation: true,
                hasMedia: false,
                hasMetadata: true,
                hasVariants: true,
                hasScore: false,
                mainInfo: true,
                productId: service.id,
                createdAt: new Date("2024-11-01"),
                updatedAt: new Date("2025-03-15"),
              }}
            />

            {/* Media */}
            <MediaGallery media={service.media} />

            {/* Title & meta */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs capitalize",
                    isExperience
                      ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800"
                      : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800",
                  )}
                >
                  {isExperience ? (
                    <Sparkles className="w-3 h-3 mr-1" />
                  ) : (
                    <Bus className="w-3 h-3 mr-1" />
                  )}
                  {service.experience?.experienceType ?? service.type}
                </Badge>

                <span className="text-xs text-muted-foreground font-mono">
                  /{service.slug}
                </span>
              </div>

              <h1 className="text-2xl font-semibold tracking-tight text-foreground leading-tight">
                {service.title}
              </h1>

              {service.shortDescription && (
                <p className="text-base text-muted-foreground leading-relaxed">
                  {service.shortDescription}
                </p>
              )}
            </div>

            {/* Full description */}
            {service.description && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">About</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
              </div>
            )}

            <Separator />

            {/* Type-specific details */}
            {isExperience && service.experience && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">
                  Experience details
                </h3>
                <ExperienceDetails experience={service.experience} />
              </div>
            )}

            {!isExperience && service.transport && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">
                  Transport details
                </h3>
                <TransportDetails transport={service.transport} />
              </div>
            )}
          </div>

          {/* Right column — sticky booking card */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
              {/* Price */}
              <div className="px-5 py-5 border-b border-border space-y-1">
                <p className="text-xs text-muted-foreground font-medium">
                  Starting from
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-foreground tracking-tight">
                    {fmtCurrency(
                      Number(service.basePrice),
                      service.currency ?? "USD",
                    )}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    / person
                  </span>
                </div>
                {service.currency && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Globe className="w-3 h-3" />
                    {service.currency}
                  </div>
                )}
              </div>
              {/* Quick stats */}
              <div className="px-5 py-4 space-y-2.5">
                {service.experience && (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        Duration
                      </div>
                      <span className="text-sm font-medium">
                        {formatDuration(
                          service.experience.durationCount,
                          service.experience.durationUnit,
                        )}
                      </span>
                    </div>
                    {service.experience.difficultyLevel && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Zap className="w-3.5 h-3.5" />
                          Difficulty
                        </div>
                        <span
                          className={cn(
                            "text-sm font-medium",
                            DIFFICULTY_CONFIG[
                              service.experience.difficultyLevel
                            ].color,
                          )}
                        >
                          {
                            DIFFICULTY_CONFIG[
                              service.experience.difficultyLevel
                            ].label
                          }
                        </span>
                      </div>
                    )}
                    {service.experience.ageRestriction && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="w-3.5 h-3.5" />
                          Min age
                        </div>
                        <span className="text-sm font-medium">
                          {service.experience.ageRestriction}
                        </span>
                      </div>
                    )}
                  </>
                )}

                {service.transport && (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Bus className="w-3.5 h-3.5" />
                        Type
                      </div>
                      <span className="text-sm font-medium capitalize">
                        {service.transport.transportType}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Sparkles className="w-3.5 h-3.5" />
                        Class
                      </div>
                      <span className="text-sm font-medium capitalize">
                        {service.transport.class}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Route className="w-3.5 h-3.5" />
                        Route
                      </div>
                      <span className="text-sm font-medium">
                        {service.transport.directroute
                          ? "Direct"
                          : "With stops"}
                      </span>
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="w-3.5 h-3.5" />
                    Status
                  </div>
                  <Badge
                    variant="outline"
                    className={cn("text-xs", statusCfg.className)}
                  >
                    {statusCfg.label}
                  </Badge>
                </div>
              </div>
              {/* CTA */}
              <div className="px-5 pb-5 space-y-2.5">
                <Button
                  className="w-full"
                  size="default"
                  onClick={() =>
                    router.push(`/provider/services/${serviceId}/edit`)
                  }
                >
                  <Pencil className="w-4 h-4" />
                  Edit service
                </Button>

                <Button
                  variant="outline"
                  className="w-full cursor-pointer"
                  size="default"
                  onClick={openSheet}
                >
                  <Layers3 className="w-3.5 h-3.5 mr-2" />
                  Show variants & pricing
                </Button>
              </div>
            </div>

            {/* Meta card */}
            <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Service info
              </p>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">ID</span>
                  <span className="text-xs font-mono text-foreground">
                    {service.id}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Last updated
                  </span>
                  <span className="text-xs text-foreground">
                    {service.updatedAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Created</span>
                  <span className="text-xs text-foreground">
                    {service.createdAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Media</span>
                  <span className="text-xs text-foreground">
                    {service.media.length} file
                    {service.media.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <VariantsPricingSheet
        open={sheetOpen}
        onClose={closeSheet}
        serviceId={service.id}
        isTransport={!isExperience}
      />
    </div>
  );
}
