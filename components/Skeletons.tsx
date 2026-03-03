"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

function Bone({
  className = "",
  style = {},
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`rounded-lg bg-[#e8e4de] dark:bg-[#2a2930] overflow-hidden relative ${className}`}
      style={style}
    >
      {/* Shimmer sweep */}
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 40%, rgba(255,255,255,0.32) 50%, rgba(255,255,255,0.18) 60%, transparent 100%)",
        }}
        animate={{ x: ["-100%", "100%"] }}
        transition={{
          duration: 1.6,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}

export function TransportCardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex flex-col rounded-2xl border box"
      style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.05)" }}
    >
      <Bone className="h-0.5 w-2/3 rounded-none shrink-0" />

      <div className="px-5 pt-5 pb-5 flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Bone className="w-11 h-11 rounded-xl shrink-0" />

            <div className="flex flex-col gap-1.5">
              <Bone className="h-2.5 w-16 rounded-full" />
              <Bone className="h-2.5 w-24 rounded-full" />
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <Bone className="h-4 w-14 rounded-full" />
            <Bone className="h-4 w-4 rounded-full" />
          </div>
        </div>

        <Bone className="h-4 w-4/5 rounded-lg" />

        <div className="flex items-center gap-2">
          <Bone className="w-2 h-2 rounded-full shrink-0" />
          <Bone className="h-2.5 w-14 rounded-full" />
          <Bone className="h-px rounded-full w-full" />
          <Bone className="w-3 h-3 rounded-full shrink-0" />
          <Bone className="h-2.5 w-14 rounded-full" />
        </div>

        <div className="flex items-center gap-2">
          <Bone className="h-4 w-20 rounded-full" />
          <Bone className="h-4 w-24 rounded-full" />
        </div>
      </div>

      <div className="px-5 pb-5 flex flex-col gap-4 flex-1">
        <div className="flex flex-col gap-1.5">
          <Bone className="h-2.5 w-full rounded-full" />
          <Bone className="h-2.5 w-3/4 rounded-full" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-xl px-3 py-2 border border-[#e8e4de] dark:border-[#2a2930] bg-[#f8f6f1] dark:bg-[#0f0f14]"
            >
              <Bone className="w-3.5 h-3.5 rounded-full shrink-0" />
              <div className="flex flex-col gap-1 flex-1">
                <Bone className="h-2 w-10 rounded-full" />
                <Bone className="h-2.5 w-14 rounded-full" />
              </div>
            </div>
          ))}
        </div>

        <div className="h-px bg-[#e8e4de] dark:bg-[#2a2930]" />

        <div className="flex items-end justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <Bone className="h-2 w-16 rounded-full" />
            <Bone className="h-7 w-24 rounded-lg" />
          </div>
          <Bone className="h-9 w-24 rounded-xl" />
        </div>
      </div>
    </motion.div>
  );
}

export function ExperienceCardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex flex-col rounded-2xl border box"
      style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.05)" }}
    >
      <Bone className="h-56 w-full rounded-none shrink-0" />

      <div className="p-4 flex flex-col gap-4 flex-1">
        <div className="flex items-start justify-between gap-2">
          <Bone className="h-5 w-3/4 rounded-lg" />
          <Bone className="w-4.5 h-4.5 rounded-full shrink-0" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Bone className="h-3 w-full rounded-full" />
          <Bone className="h-3 w-5/6 rounded-full" />
        </div>

        <div className="flex items-center justify-between">
          <Bone className="h-3 w-28 rounded-full" />
          <Bone className="h-3 w-20 rounded-full" />
        </div>

        <div className="h-px bg-[#e8e4de] dark:bg-[#2a2930]" />

        <div className="flex items-end justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <Bone className="h-2.5 w-16 rounded-full" />
            <Bone className="h-6 w-20 rounded-lg" />
          </div>
          <Bone className="h-9 w-24 rounded-xl" />
        </div>
      </div>
    </motion.div>
  );
}

export function ProviderCardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col rounded-2xl border box"
      style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.05)" }}
    >
      <Bone className="h-32 w-full rounded-none" />
      <div className="px-5 pb-5 pt-7 flex flex-col gap-3 relative">
        <Bone className="absolute -top-6 left-5 w-12 h-12 rounded-2xl border-2 border-white dark:border-[#0f0f14]" />
        <div className="flex items-start justify-between mt-2 gap-2">
          <div className="flex flex-col gap-1.5 flex-1">
            <Bone className="h-4 w-3/5 rounded-lg" />
            <Bone className="h-3 w-2/5 rounded-full" />
          </div>
          <Bone className="h-5 w-16 rounded-full shrink-0" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Bone className="h-2.5 w-full rounded-full" />
          <Bone className="h-2.5 w-4/5 rounded-full" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <Bone key={i} className="h-14 rounded-xl" />
          ))}
        </div>
        <Bone className="h-9 w-full rounded-xl" />
      </div>
    </motion.div>
  );
}

export default function SkeletonGrid({
  type,
  count = 6,
}: {
  count?: number;
  type: "transport" | "experince" | "provider";
}) {
  const isMobile = useIsMobile();
  const finalCount = isMobile ? Math.floor(count / 2) : count;

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: finalCount }).map((_, i) => {
        switch (type) {
          case "experince":
            return <ExperienceCardSkeleton key={i} delay={i * 0.07} />;

          case "transport":
            return <TransportCardSkeleton key={i} delay={i * 0.07} />;

          case "provider":
            return <ProviderCardSkeleton key={i} delay={i * 0.07} />;

          default:
            return null;
        }
      })}
    </div>
  );
}
