"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, motion, AnimatePresence, Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SpotlightProvider } from "@/lib/all-types";
import SkeletonGrid from "./Skeletons";
import Link from "next/link";
import { ProviderCard } from "./ProviderCard";
import { providerUrl } from "@/lib/url-builder";

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

function SpotlightContent() {
  const [providers, setProviders] = useState<SpotlightProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const url = providerUrl({limit:6 ,status:"approved"})
  const fetchProviders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed to fetch providers");
      const data = await res.json();
      setProviders(data.data.data);
    } catch (err: unknown) {
      err instanceof Error
        ? setError(err.message)
        : setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
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
          className="w-full"
        >
          <SkeletonGrid type="provider" />
        </motion.div>
      ) : error ? (
        <motion.div
          key="error"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="text-center py-10 flex flex-col items-center justify-center"
        >
          <p className="text-base max-w-sm text-red-500 font-semibold">
            {error || "We couldn't load the providers."}
          </p>
          <motion.button
            onClick={fetchProviders}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            className="px-5 py-2 rounded-xl text-xs font-bold border text-green-1 border-green-1/50 bg-green-1/10 mt-5"
          >
            Try again
          </motion.button>
        </motion.div>
      ) : (
        <motion.div
          key="grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {providers.map((p, i) => (
            <ProviderCard key={p.id} provider={p} delay={i * 0.08} />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function ProvidersSpotlight() {
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-60px" });

  return (
    <section className="relative overflow-hidden py-24 bg-waylink-fade transition-colors duration-500 font-sans">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-10 left-0 w-80 h-80 rounded-full opacity-[0.06] bg-radial from-green-1 to-transparent blur-3xl"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-0 w-72 h-72 rounded-full opacity-[0.06] bg-radial from-blue-10 to-transparent blur-3xl"
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
              id="spotlight-grid"
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
          <rect width="100%" height="100%" fill="url(#spotlight-grid)" />
        </svg>
      </div>

      <div className="mian-container relative z-10">
        <motion.div
          ref={headerRef}
          variants={headerVariants}
          initial="hidden"
          animate={headerInView ? "visible" : "hidden"}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                className="h-px w-10 bg-linear-to-r from-transparent to-green-1"
                initial={{ scaleX: 0 }}
                animate={headerInView ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              />
              <span className="text-xs font-bold tracking-[0.22em] uppercase text-green-1">
                Provider Spotlight
              </span>
            </div>

            <h2
              className="text-4xl md:text-5xl font-extrabold leading-[1.05]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Meet the People{" "}
              <motion.span
                className="inline-block bg-linear-135 from-green-1 via-blue-10 to-orange-3 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -10 }}
                animate={headerInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.25 }}
              >
                Behind the Magic.
              </motion.span>
            </h2>

            <p className="mt-3 text-sm leading-relaxed max-w-md text-muted-foreground">
              Top-rated, verified providers trusted by thousands of travellers —
              from independent guides to full-service agencies.
            </p>
          </div>

          <Link
            href="/providers"
            className="shrink-0 self-start md:self-auto flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-linear-135 from-green-1 to-blue-10 shadow-md shadow-green-1/25 hover:scale-101 transition-all duration-300"
          >
            All Providers
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

        <SpotlightContent />
      </div>
    </section>
  );
}
