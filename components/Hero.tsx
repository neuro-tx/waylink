"use client";

import { Button } from "@/components/ui/button";
import {
  BadgeCheck,
  FerrisWheel,
  Headphones,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import Image from "next/image";
import { motion, Variants } from "motion/react";
import Link from "next/link";

const trusts = [
  { icon: ShieldCheck, label: "Verified Providers", accent: "#FF6B35" },
  { icon: BadgeCheck, label: "Better UX", accent: "#845EF7" },
  { icon: Headphones, label: "24 / 7 Support", accent: "#00C9A7" },
];

const stats = [
  {
    value: "2M+",
    label: "Happy Travelers",
    accent: "#FF6B35",
    pos: "top-8 -left-6",
  },
  {
    value: "4.9★",
    label: "Avg. Rating",
    accent: "#00C9A7",
    pos: "bottom-8 -left-8",
  },
  {
    value: "50K+",
    label: "Experiences",
    accent: "#845EF7",
    pos: "top-10 -right-6",
  },
];

export default function Hero() {
  return (
    <section className="relative min-h-svh flex items-center justify-center overflow-hidden bg-waylink-fade">
      <AmbientBackground />

      <div className="mx-auto relative container px-3 md:px-6 lg:px-9 py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={container}
            className="space-y-8"
          >
            <motion.div variants={fadeUp}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide border box">
                <motion.span
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatDelay: 1,
                  }}
                >
                  ✨
                </motion.span>
                Be Smart,
                <span className="font-extrabold bg-clip-text text-transparent bg-linear-135 from-orange-3 to-[#845EF7]">
                  Move Smarter
                </span>
              </div>
            </motion.div>

            <motion.div variants={fadeUp}>
              <h1
                className="text-5xl md:text-6xl xl:text-7xl font-extrabold leading-[1.04] tracking-tight"
                style={{ fontFamily: "Georgia, serif" }}
              >
                <span>Travel </span>
                <span className="bg-clip-text text-transparent bg-linear-135 from-orange-3 to-[#845EF7]">
                  smarter.
                </span>
                <br />
                <span>Book </span>
                <span className="bg-clip-text text-transparent bg-linear-135 from-[#845EF7] to-green-1">
                  faster.
                </span>
                <br />
                <span>Go </span>
                <span className="bg-clip-text text-transparent bg-linear-135 from-green-1 to-orange-3">
                  further.
                </span>
              </h1>
            </motion.div>

            <motion.p
              variants={fadeUp}
              className="text-base leading-relaxed max-w-lg text-gray-light"
            >
              Find transport, trips, and experiences in one place. Compare
              providers, prices, and schedules in seconds with{" "}
              <span className="font-bold font-mono text-orange-3">
                Way_Link
              </span>
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
              {trusts.map(({ icon: Icon, label, accent }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.5 + i * 0.1,
                    duration: 0.4,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border box"
                  style={{ color: accent }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="flex gap-4 flex-wrap">
              <Button asChild size="lg">
                <Link href="/most-rating" className="group w-full sm:w-fit">
                  <span className="relative flex items-center gap-2">
                    <Star className="w-4 h-4 transition-all duration-300 group-hover:rotate-12 group-hover:scale-0" />

                    <Sparkles className="absolute w-4 h-4 opacity-0 scale-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 " />

                    <span>Browse Top Rated</span>
                  </span>
                </Link>
              </Button>

              <Button size="lg" variant="outline" asChild>
                <Link
                  href="/become-provider"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-bold border transition-all duration-200 box"
                >
                  <FerrisWheel className="w-4 h-4" />
                  Become a Partner
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.9,
              ease: "easeOut",
              delay: 0.3,
            }}
            className="relative"
          >
            <div className="overflow-hidden border shadow-2xl bg-card rounded-xl select-none">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#e8e4de] dark:border-[#2a2930]">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400/80" />
                  <div className="h-3 w-3 rounded-full bg-green-400/80" />
                </div>
                <div className="ml-3 flex-1 flex items-center gap-2 px-3 py-1 rounded-md text-xs bg-[#f0ede8] dark:bg-[#0f0f14] text-gray-light">
                  <div className="w-2 h-2 rounded-full bg-[#00C9A7]" />
                  waylink.app / explore
                </div>
              </div>

              <div className="relative aspect-4/3">
                <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/30 z-10" />

                <Image
                  src="/preview.png"
                  alt="preview-image"
                  fill
                  priority
                  className="object-cover"
                />
              </div>

              {stats.map(({ value, label, accent, pos }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.7 + i * 0.15,
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{
                    animationDelay: `${i * 0.8}s`,
                  }}
                  className={`absolute ${pos} z-20 hidden md:inline`}
                >
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{
                      duration: 3 + i,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.5,
                    }}
                    className="flex flex-col items-center px-4 py-2.5 rounded-2xl border box"
                    style={{ boxShadow: `0 8px 24px ${accent}25` }}
                  >
                    <span
                      className="text-lg font-extrabold leading-none font-serif"
                      style={{
                        color: accent,
                      }}
                    >
                      {value}
                    </span>
                    <span className="text-[10px] font-semibold mt-0.5 text-gray-light whitespace-nowrap">
                      {label}
                    </span>
                  </motion.div>
                </motion.div>
              ))}
            </div>

            <div className="absolute -inset-6 -z-10 bg-primary/10 blur-3xl rounded-full" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- VARIANTS ---------------- */

const container: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
    filter: "blur(4px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

function AmbientBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 isolate overflow-hidden"
    >
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />

      <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl" />

      <div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

      <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="absolute inset-y-0 left-1/2 w-px bg-linear-to-b from-transparent via-border/40 to-transparent" />
    </div>
  );
}
