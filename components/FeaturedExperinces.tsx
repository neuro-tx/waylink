"use client";

import { Compass } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { ProductGrid } from "./Product";
import SkeletonGrid from "./Skeletons";
import { ProductCardProps } from "@/lib/all-types";

export const FeaturedExperinces = () => {
  return (
    <section className="w-full relative overflow-hidden bg-waylink-fade">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-10 right-0 w-80 h-80 rounded-full opacity-[0.07]"
          style={{
            background: "radial-gradient(circle, #FF6B35 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 left-0 w-72 h-72 rounded-full opacity-[0.05]"
          style={{
            background: "radial-gradient(circle, #845EF7 0%, transparent 70%)",
            filter: "blur(50px)",
          }}
          animate={{ y: [0, -10, 0] }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        <svg className="absolute inset-0 w-full h-full opacity-[0.025]">
          <defs>
            <pattern
              id="exp-grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#exp-grid)" />
        </svg>
      </div>

      <div className="py-24 mian-container space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                className="h-px w-10 bg-linear-to-r from-transparent to-orange-3"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              />
              <span className="text-xs font-bold tracking-[0.22em] uppercase font-serif text-orange-3">
                Curated For You
              </span>
            </div>
            <h2
              className="text-5xl md:text-7xl font-bold leading-none text-stone-900 dark:text-white"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Featured
              <br />
              <span className="italic text-transparent bg-clip-text bg-linear-to-r from-rose-500 via-amber-400 to-violet-500 dark:from-rose-400 dark:via-amber-300 dark:to-violet-400">
                Experiences
              </span>
            </h2>
          </div>
          <p
            style={{ fontFamily: "'Georgia', serif" }}
            className="text-lg max-w-xs leading-relaxed text-muted-foreground italic"
          >
            Extraordinary moments curated from every corner of the world.
          </p>
        </div>

        <FeaturedContent />
      </div>
    </section>
  );
};

function FeaturedContent() {
  const [experiences, setExperiences] = useState<ProductCardProps[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExps = async () => {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const res = await fetch(
          `${baseUrl}/api/product/features?type=experience&limit=6`,
        );
        if (!res.ok) throw new Error("Failed to fetch experiences");
        const data = await res.json();
        setExperiences(data.data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchExps();
  }, []);

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div
          key="skeleton"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <SkeletonGrid type="experince" count={6} />
        </motion.div>
      ) : error ? (
        <motion.div
          key="error"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center py-20"
        >
          <Compass className="w-12 h-12 mx-auto mb-4 opacity-20 text-orange-3" />
          <p className="text-sm text-muted-foreground tracking-wide">{error}</p>
          <motion.button
            onClick={() => {
              setError(null);
              setLoading(true);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            className="mt-4 px-5 py-2 rounded-xl text-xs font-bold border text-orange-3 border-[#FF6B3550] bg-[#FF6B3510]"
          >
            Try again
          </motion.button>
        </motion.div>
      ) : experiences.length > 0 ? (
        <motion.div
          key="grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ProductGrid products={experiences} />
        </motion.div>
      ) : (
        <motion.div
          key="empty"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center py-20"
        >
          <Compass className="w-12 h-12 mx-auto mb-4 opacity-20 text-orange-3" />
          <p className="text-sm text-muted-foreground tracking-wide">
            No featured experiences available right now.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
