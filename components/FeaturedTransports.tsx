"use client";
import { Transport } from "@/lib/all-types";
import { useEffect, useRef, useState } from "react";
import { useInView, motion, AnimatePresence, Variants } from "framer-motion";
import { ArrowRight, Car } from "lucide-react";
import SkeletonGrid from "./Skeletons";
import Link from "next/link";
import { TransportCard } from "./Transport";

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function FeaturedTransport() {
  const [transports, setTransports] = useState<Transport[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-60px" });

  const gridRef = useRef<HTMLDivElement>(null);
  const gridInView = useInView(gridRef, { once: true, margin: "-60px" });

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const getData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${baseUrl}/api/transports/feature`);
        if (!res.ok) throw new Error("Failed to fetch featured transports");
        const data = await res.json();
        setTransports(data.data ?? []);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

  return (
    <section className="relative overflow-hidden py-24 bg-waylink-fade transition-colors duration-500 font-sans">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-10 right-0 w-80 h-80 rounded-full opacity-[0.07] blur-3xl bg-radial from-blue-10 to-transparent"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 left-0 w-72 h-72 rounded-full opacity-6 blur-2xl bg-radial from-green-1 to-transparent"
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
              id="transport-grid"
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
          <rect width="100%" height="100%" fill="url(#transport-grid)" />
        </svg>
      </div>

      <div className="mian-container relative z-10">
        <motion.div
          ref={headerRef}
          variants={headerVariants}
          initial="hidden"
          animate={headerInView ? "visible" : "hidden"}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  className="h-px w-10 bg-linear-to-r from-transparent to-blue-10"
                  initial={{ scaleX: 0 }}
                  animate={headerInView ? { scaleX: 1 } : { scaleX: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                />
                <span className="text-xs font-bold tracking-[0.22em] uppercase text-blue-10">
                  Transport
                </span>
              </div>

              <h2
                className="text-4xl md:text-5xl font-extrabold leading-[1.05]"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Get There,{" "}
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={headerInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.7, delay: 0.25 }}
                  className="bg-linear-135 bg-clip-text text-transparent from-blue-10 via-green-1 to-orange-3 inline-block"
                >
                  In Style.
                </motion.span>
              </h2>
            </div>

            <p className="text-base max-w-xs text-gray-light md:text-right font-georgia italic">
              From private sedans to scenic helicopters — every ride on WayLink
              is vetted, comfortable, and unforgettable.
            </p>
          </div>
        </motion.div>

        <motion.div
          ref={gridRef}
          variants={containerVariants}
          initial="hidden"
          animate={gridInView ? "visible" : "hidden"}
        >
          <AnimatePresence mode="wait">
            {loading ? (
              <SkeletonGrid type="transport" />
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center py-20 text-red-500"
              >
                <Car className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-sm tracking-wide">{error}</p>
              </motion.div>
            ) : transports.length > 0 ? (
              <motion.div
                key="data"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
              >
                {transports.map((product) => (
                  <TransportCard key={product.id} product={product} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center py-20 text-muted-foreground"
              >
                <Car className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-sm tracking-wide">
                  No featured transport options available.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={gridInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 text-center"
        >
          <Link
            href="/transport"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl text-sm font-bold text-white bg-linear-135 from-blue-10 to-green-1 capitalize hover:scale-101 transition-all duration-300"
          >
            view all transports
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
