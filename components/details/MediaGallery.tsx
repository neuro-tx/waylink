"use client";

import { useMemo, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, ImageIcon, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Media } from "@/lib/all-types";

export function MediaGallery({ media }: { media: Media[] }) {
  const [active, setActive] = useState<number | null>(null);

  const sorted = useMemo(
    () => [...media].sort((a, b) => a.display_order - b.display_order),
    [media],
  );

  const count = sorted.length;

  const open = useCallback((index: number) => setActive(index), []);
  const close = useCallback(() => setActive(null), []);

  const goPrev = useCallback(() => {
    setActive((prev) => (prev === null ? null : (prev - 1 + count) % count));
  }, [count]);

  const goNext = useCallback(() => {
    setActive((prev) => (prev === null ? null : (prev + 1) % count));
  }, [count]);

  if (!count) return null
  const remaining = count - 5;

  return (
    <>
      {active !== null && (
        <Lightbox
          items={sorted}
          active={active}
          onClose={close}
          onPrev={goPrev}
          onNext={goNext}
        />
      )}

      {count === 1 && (
        <div className="h-72 sm:h-80 md:h-96">
          <Tile
            item={sorted[0]}
            index={0}
            onOpen={open}
            className="relative h-full w-full rounded-2xl"
          />
        </div>
      )}

      {count === 2 && (
        <div className="grid grid-cols-2 gap-1.5 h-64 sm:h-80 md:h-96">
          {sorted.map((item, index) => (
            <Tile
              key={item.id}
              item={item}
              index={index}
              onOpen={open}
              className="relative h-full"
            />
          ))}
        </div>
      )}

      {count >= 3 && (
        <div className="flex flex-col gap-1.5 md:grid md:grid-cols-2 md:grid-rows-2 md:h-112">
          <Tile
            item={sorted[0]}
            index={0}
            onOpen={open}
            className="relative h-72 sm:h-96 md:h-full md:row-span-2"
          />

          <div className="grid grid-cols-2 grid-rows-2 gap-1.5 h-48 sm:h-64 md:h-full md:row-span-2">
            {sorted.slice(1, 5).map((item, i) => {
              const index = i + 1;
              const isLastVisible = i === 3 && remaining > 0;

              return (
                <Tile
                  key={item.id}
                  item={item}
                  index={index}
                  onOpen={open}
                  className="relative h-full min-h-0"
                  overlay={
                    isLastVisible ? (
                      <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                        <span className="text-white text-xl font-semibold tracking-tight">
                          +{remaining}
                        </span>
                      </div>
                    ) : undefined
                  }
                />
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

function Lightbox({
  items,
  active,
  onClose,
  onPrev,
  onNext,
}: {
  items: Media[];
  active: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const current = items[active];
  const isVideo = current.type === "video";

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      {items.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 z-10"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
          >
            <ChevronLeft className="size-6" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 z-10"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
          >
            <ChevronRight className="size-6" />
          </Button>
        </>
      )}

      <div
        className="relative w-full max-w-4xl max-h-[75vh] mx-16"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full overflow-hidden rounded-2xl bg-black">
          {isVideo ? (
            <video
              src={current.url}
              controls
              autoPlay
              className="w-full max-h-[75vh] object-cover"
            />
          ) : (
            <img
              src={current.url}
              alt={`Media ${active + 1}`}
              className="w-full max-h-[75vh] object-cover"
            />
          )}
        </div>

        {items.length > 1 && (
          <p className="mt-3 text-center text-sm text-white/90">
            {active + 1} / {items.length}
          </p>
        )}
      </div>
    </div>
  );
}

function Tile({
  item,
  index,
  onOpen,
  className,
  overlay,
}: {
  item: Media;
  index: number;
  onOpen: (index: number) => void;
  className?: string;
  overlay?: React.ReactNode;
}) {
  const isVideo = item.type === "video";

  return (
    <button
      onClick={() => onOpen(index)}
      className={cn(
        "relative overflow-hidden rounded-xl bg-muted group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        className,
      )}
    >
      {isVideo ? (
        <>
          <video
            src={item.url}
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-full bg-black/55 p-3 backdrop-blur-sm">
              <Play className="size-5 text-white fill-white" />
            </div>
          </div>
        </>
      ) : (
        <img
          src={item.url}
          alt={`Media ${index + 1}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
        />
      )}

      <div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/10" />
      {overlay}
    </button>
  );
}
