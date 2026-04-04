"use client";

import { Badge } from "../ui/badge";
import { Bus, Clock, Compass, MapPin, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { DifficultyLevel, ProductDetails ,ExperienceDetails } from "@/lib/all-types";
import Link from "next/link";

const DIFFICULTY_CONFIG: Record<
  DifficultyLevel,
  { label: string; className: string }
> = {
  easy: {
    label: "Easy",
    className:
      "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
  },
  moderate: {
    label: "Moderate",
    className:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
  },
  challenging: {
    label: "Challenging",
    className:
      "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800",
  },
  extreme: {
    label: "Extreme",
    className:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
  },
};

function fmtExperienceDuration(
  count: number | string | null,
  unit: string | null,
) {
  if (!count) return "Duration unavailable";
  return `${count} ${count === 1 ? unit?.slice(0, -1) : unit}`;
}

export const MainInfo = ({
  product,
  exeperinceDetails,
}: {
  product: ProductDetails;
  exeperinceDetails: ExperienceDetails | null;
}) => {
  if (!product) return null;

  return (
    <div className="space-y-6">
      <div className="space-y-2 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-xs capitalize">
            {product.type === "experience" ? (
              <Compass className="size-3 mr-1" />
            ) : (
              <Bus className="size-3 mr-1" />
            )}
            {product.type}
          </Badge>

          {product.type === "experience" &&
            exeperinceDetails?.difficultyLevel && (
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  DIFFICULTY_CONFIG[exeperinceDetails.difficultyLevel]
                    ?.className,
                )}
              >
                {DIFFICULTY_CONFIG[exeperinceDetails.difficultyLevel]?.label}
              </Badge>
            )}

          {product.type === "experience" && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="size-3" />
              {fmtExperienceDuration(
                exeperinceDetails?.durationCount ?? 0,
                exeperinceDetails?.durationUnit as string,
              )}
            </span>
          )}
        </div>

        <h1 className="text-2xl font-bold leading-tight">{product.title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          {product?.stats?.averageRating !== null && (
            <div className="flex items-center gap-1.5">
              <StarRating value={Number(product?.stats?.averageRating)} />
              <span className="font-medium">
                {product?.stats?.averageRating
                  ? Number(product?.stats?.averageRating).toFixed(1)
                  : "N/A"}
              </span>
              <span className="text-muted-foreground">
                ({product?.stats?.reviewsCount} reviews)
              </span>
            </div>
          )}
          <span className="text-muted-foreground flex items-center gap-1">
            <MapPin className="size-3.5" />
            by{" "}
            <span className="font-medium text-foreground ml-1 hover:underline hover:text-amber-500">
              <Link href={`/providers/${product.provider.id}`}>{product.provider.name}</Link>
            </span>
          </span>
        </div>

        {product.shortDescription && (
          <p className="text-muted-foreground text-sm leading-relaxed pt-1">
            {product.shortDescription}
          </p>
        )}
      </div>
    </div>
  );
};

function StarRating({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-3.5",
            i < Math.round(value)
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted-foreground/30",
          )}
        />
      ))}
    </div>
  );
}
