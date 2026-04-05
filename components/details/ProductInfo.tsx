"use client";

import {
  AlertTriangle,
  BedDouble,
  Bus,
  CheckCircle2,
  Compass,
  Info,
  LucideIcon,
  Luggage,
  MapPin,
  Navigation,
  Shield,
  Users,
  Utensils,
  XCircle,
  Zap,
} from "lucide-react";
import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Separator } from "../ui/separator";
import { cn } from "@/lib/utils";
import {
  ExperienceDetails,
  Itinerary,
  TransportDetails,
} from "@/lib/all-types";
import { Button } from "../ui/button";

export function Section({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("gap-3", className)}>
      <CardHeader>
        <div className="flex items-center gap-2">
          {Icon && <Icon className="size-4.5" />}
          <h2 className="text-base font-semibold uppercase tracking-wide">
            {title}
          </h2>
        </div>
      </CardHeader>
      <Separator />
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function BulletList({
  items,
  icon: Icon,
  iconClass,
}: {
  items: string[];
  icon: LucideIcon;
  iconClass?: string;
}) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm">
          <Icon
            className={cn(
              "size-4 mt-0.5 shrink-0",
              iconClass ?? "text-muted-foreground",
            )}
          />
          <span className="text-foreground leading-snug">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function ExperienceSections({ exp }: { exp: ExperienceDetails }) {
  return (
    <>
      {((exp.included?.length ?? 0) > 0 ||
        (exp.notIncluded?.length ?? 0) > 0) && (
        <Section title="What's included" icon={CheckCircle2}>
          <div className="grid sm:grid-cols-2 gap-6">
            {exp.included && exp.included.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                  Included
                </p>
                <BulletList
                  items={exp.included}
                  icon={CheckCircle2}
                  iconClass="text-green-500"
                />
              </div>
            )}
            {exp.notIncluded && exp.notIncluded.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                  Not included
                </p>
                <BulletList
                  items={exp.notIncluded}
                  icon={XCircle}
                  iconClass="text-red-400"
                />
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Requirements */}
      {exp.requirements && exp.requirements.length > 0 && (
        <Section title="Requirements" icon={Shield}>
          <div className="space-y-3">
            <BulletList
              items={exp.requirements}
              icon={Info}
              iconClass="text-amber-500"
            />
            {exp.ageRestriction && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                <Users className="size-3.5 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground">
                  Age restriction:{" "}
                  <span className="font-medium text-foreground">
                    {exp.ageRestriction}
                  </span>
                </span>
              </div>
            )}
          </div>
        </Section>
      )}

      <ItinerarySection itineraries={exp.itineraries} />
    </>
  );
}

export default function ItinerarySection({
  itineraries,
}: {
  itineraries: Itinerary[];
}) {
  const [visibleCount, setVisibleCount] = useState(5);

  const sortedItineraries = [...itineraries].sort(
    (a, b) => a.dayNumber - b.dayNumber,
  );

  const showMore = () =>
    setVisibleCount((prev) => Math.min(prev + 3, sortedItineraries.length));
  const showLess = () => setVisibleCount(5);

  const visibleItineraries = sortedItineraries.slice(0, visibleCount);

  return (
    <Section title="Itinerary" icon={Compass}>
      {itineraries.length > 0 ? (
        <div className="space-y-0">
          {visibleItineraries.map((day, i, arr) => (
            <div key={day.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold shrink-0">
                  {day.dayNumber}
                </div>
                {i < arr.length - 1 && (
                  <div className="w-px flex-1 bg-green-1 my-0 min-h-6" />
                )}
              </div>
              <div
                className={cn(
                  "pb-6 flex-1 min-w-0",
                  i === arr.length - 1 && "pb-0",
                )}
              >
                <p className="text-sm font-semibold leading-tight mb-1">
                  {day.title}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {day.description}
                </p>

                {day.activities && day.activities.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {day.activities.map((a, ai) => (
                      <span
                        key={ai}
                        className="text-xs bg-muted border border-border rounded-full px-2.5 py-0.5 text-muted-foreground"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-3 flex flex-wrap gap-4">
                  {day.mealsIncluded && day.mealsIncluded.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Utensils className="size-3" />
                      {day.mealsIncluded.join(", ")}
                    </div>
                  )}
                  {day.accommodationInfo && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <BedDouble className="size-3" />
                      {day.accommodationInfo}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {sortedItineraries.length > 5 && (
            <div className="mt-4">
              {visibleCount < sortedItineraries.length ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={showMore}
                  className="text-sm text-primary hover:underline"
                >
                  Show More
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={showLess}
                  className="text-sm text-primary hover:underline"
                >
                  Show Less
                </Button>
              )}
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-destructive flex items-center gap-2">
          <Info className="size-4.5" />
          No itineraries available.
        </p>
      )}
    </Section>
  );
}

export function TransportSections({ tr }: { tr: TransportDetails }) {
  return (
    <>
      {/* Route info */}
      {(tr.departureAddress || tr.arrivalAddress) && (
        <Section title="Route" icon={Navigation}>
          <div className="space-y-3">
            {tr.departureAddress && (
              <div className="flex items-start gap-2.5">
                <div className="size-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Departure
                  </p>
                  <p className="text-sm font-medium">{tr.departureAddress}</p>
                </div>
              </div>
            )}
            {tr.departureAddress && tr.arrivalAddress && (
              <div className="ml-1 w-px h-4 bg-border" />
            )}
            {tr.arrivalAddress && (
              <div className="flex items-start gap-2.5">
                <div className="size-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Arrival
                  </p>
                  <p className="text-sm font-medium">{tr.arrivalAddress}</p>
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-4 pt-2 border-t border-border mt-2">
              {tr.distance && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="size-3.5" />
                  {tr.distance} km
                </div>
              )}
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Zap className="size-3.5" />
                {tr.hasDirectRoute ? "Direct route" : "With stops"}
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* Transport details */}
      <Section title="Transport details" icon={Bus}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {tr.transportType && (
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                Type
              </p>
              <p className="text-sm font-medium capitalize">
                {tr.transportType}
              </p>
            </div>
          )}
          {tr.transportClass && (
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                Class
              </p>
              <p className="text-sm font-medium capitalize">
                {tr.transportClass}
              </p>
            </div>
          )}
          {tr.seatType && (
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                Seat type
              </p>
              <p className="text-sm font-medium capitalize">{tr.seatType}</p>
            </div>
          )}
          {tr.luggageAllowance && (
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                Luggage
              </p>
              <p className="text-sm font-medium">{tr.luggageAllowance}</p>
            </div>
          )}
          {tr.extraLuggageFee && Number(tr.extraLuggageFee) > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                Extra luggage
              </p>
              <p className="text-sm font-medium">${tr.extraLuggageFee}</p>
            </div>
          )}
        </div>

        {tr.amenities && tr.amenities.length > 0 && (
          <>
            <Separator className="my-4" />
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                Amenities
              </p>
              <div className="flex flex-wrap gap-2">
                {tr.amenities.map((a, i) => (
                  <span
                    key={i}
                    className="text-xs bg-muted border border-border rounded-full px-2.5 py-1 text-muted-foreground flex items-center gap-1"
                  >
                    <Luggage className="size-3" />
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </Section>

      {/* Important notes */}
      {tr.importantNotes && tr.importantNotes.length > 0 && (
        <Section title="Important notes" icon={AlertTriangle}>
          <BulletList
            items={tr.importantNotes}
            icon={Info}
            iconClass="text-amber-500"
          />
        </Section>
      )}
    </>
  );
}
