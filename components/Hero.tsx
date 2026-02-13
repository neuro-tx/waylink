"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, FerrisWheel, Sparkles, Star } from "lucide-react";
import Image from "next/image";
import { motion, Variants } from "motion/react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-svh flex items-center justify-center overflow-hidden">
      <AmbientBackground />

      <div className="mx-auto relative container px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={container}
            className="space-y-8"
          >
            <motion.div variants={fadeUp}>
              <div className="bg-secondary w-fit px-4 font-semibold rounded-full text-sm py-1.5">
                ✨ Be Smart,
                <span className="text-transparent bg-linear-to-r from-purple-500 to-lime-500 bg-clip-text ml-1">
                  Move Smarter
                </span>
              </div>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl md:text-6xl xl:text-6xl font-bold tracking-tight"
            >
              Travel smarter.
              <br />
              Book faster.
              <span className="block text-blue-20">Go further.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-muted-foreground text-lg max-w-xl"
            >
              Find transport, trips, and experiences in one place. Compare
              providers, prices, and schedules in seconds with{" "}
              <span className="underline text-orange-2 font-mono">
                Way_Link
              </span>
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="flex md:items-center gap-3 md:gap-6 text-sm text-muted-foreground flex-col md:flex-row"
            >
              <div>
                <span className="text-green-500">✓</span> Verified Providers
              </div>
              <div>
                <span className="text-green-500">✓</span> Better UX
              </div>
              <div>
                <span className="text-green-500">✓</span> 24/7 Support
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="flex gap-4">
              <Button asChild size="lg">
                <Link href="/most-rating" className="group">
                  <span className="relative flex items-center gap-2">
                    <Star className="w-4 h-4 transition-all duration-300 group-hover:rotate-12 group-hover:scale-0" />

                    <Sparkles className="absolute w-4 h-4 opacity-0 scale-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 " />

                    <span>Browse Top Rated</span>
                  </span>
                </Link>
              </Button>

              <Button size="lg" variant="outline" asChild>
                <Link href="/become-provider">
                <FerrisWheel />
                Become a Partner</Link>
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
            <div className="overflow-hidden border shadow-2xl bg-card rounded-xl">
              <div className="flex items-center gap-2 px-6 py-4 border-b bg-muted/40">
                <div className="h-3 w-3 rounded-full bg-red-500/70" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
                <div className="h-3 w-3 rounded-full bg-green-500/70" />
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
