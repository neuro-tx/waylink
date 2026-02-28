"use client";

import { useRef } from "react";
import { useInView, motion, Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  TrendingUp,
  Globe,
  Wallet,
  HeartHandshake,
} from "lucide-react";

const perks = [
  {
    icon: Globe,
    label: "Global Reach",
    desc: "List once, get discovered by travellers from 80+ countries.",
    accent: "#FF6B35",
  },
  {
    icon: Wallet,
    label: "Flexible Earnings",
    desc: "Set your own prices and payout schedule. Zero lock-in.",
    accent: "#845EF7",
  },
  {
    icon: TrendingUp,
    label: "Growth Tools",
    desc: "Analytics, review management, and smart promotions built in.",
    accent: "#00C9A7",
  },
  {
    icon: HeartHandshake,
    label: "Dedicated Support",
    desc: "A real onboarding manager and 24 / 7 partner support line.",
    accent: "#FF6B35",
  },
];

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const perkVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function BecomeProvider() {
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-60px" });

  const perksRef = useRef<HTMLDivElement>(null);
  const perksInView = useInView(perksRef, { once: true, margin: "-40px" });

  const router = useRouter();

  return (
    <section className="relative overflow-hidden py-20 bg-waylink-fade font-serif">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-20 -left-20 w-96 h-96 rounded-full opacity-[0.12] blur-3xl bg-radial from-orange-3 to-transparent"
          animate={{ y: [0, -16, 0], x: [0, 10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full opacity-[0.10] blur-3xl bg-radial from-blue-10 to-transparent"
          animate={{ y: [0, -14, 0] }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full opacity-[0.03] blur-3xl bg-radial from-green-1 to-transparent"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]">
          <defs>
            <pattern
              id="provider-grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#provider-grid)" />
        </svg>
      </div>

      <div className="mian-container relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            ref={headerRef}
            variants={headerVariants}
            initial="hidden"
            animate={headerInView ? "visible" : "hidden"}
            className="flex flex-col gap-8"
          >
            <div className="flex items-center gap-3">
              <motion.div
                className="h-px w-10 bg-linear-to-r from-transparent to-orange-3"
                initial={{ scaleX: 0 }}
                animate={headerInView ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              />
              <span className="text-xs font-bold tracking-[0.22em] uppercase text-orange-3">
                For Providers
              </span>
            </div>

            <div>
              <h2
                className="text-4xl md:text-5xl font-extrabold leading-[1.05]"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Turn Your Expertise{" "}
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={headerInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.7, delay: 0.3 }}
                  className="inline-block bg-clip-text text-transparent bg-linear-135 from-orange-3 via-blue-10 to-green-1"
                >
                  Into Income.
                </motion.span>
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-muted-foreground max-w-md">
                Whether you're a tour guide, transport operator, or travel
                agency — WayLink gives you everything you need to list, sell,
                and grow. Join over 3,000 providers already earning on the
                platform.
              </p>
            </div>

            <div className="flex items-center gap-6 flex-wrap">
              {[
                { label: "3,000+", sub: "Active Providers" },
                { label: "50K+", sub: "Monthly Bookings" },
                { label: "98%", sub: "Satisfaction Rate" },
              ].map(({ label, sub }) => (
                <div key={sub} className="flex flex-col">
                  <span
                    className="text-2xl font-extrabold"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    {label}
                  </span>
                  <span className="text-xs text-gray-light">{sub}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <motion.button
                type="button"
                onClick={() => router.push("/become-provider")}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-linear-135 from-blue-10 to-green-1 shadow-lg shadow-green-1/20 cursor-pointer"
              >
                Start Listing
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-light">
              <BadgeCheck className="w-4 h-4 text-green-1" />
              <span>All providers go through our verification process</span>
            </div>
          </motion.div>

          <motion.div
            ref={perksRef}
            variants={containerVariants}
            initial="hidden"
            animate={perksInView ? "visible" : "hidden"}
            className="grid grid-cols-2 gap-4"
          >
            {perks.map(({ icon: Icon, label, desc, accent }) => (
              <motion.div
                key={label}
                variants={perkVariants}
                className="relative flex flex-col gap-3 rounded-2xl border p-5 overflow-hidden box"
              >
                <div
                  className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-20 blur-md"
                  style={{
                    background: `radial-gradient(circle, ${accent}, transparent)`,
                  }}
                />

                <div
                  className="absolute top-0 left-0 right-0 h-0.5"
                  style={{
                    background: `linear-gradient(to right, ${accent}, ${accent}00)`,
                  }}
                />

                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center border"
                  style={{
                    background: `linear-gradient(135deg, ${accent}22, ${accent}08)`,
                    borderColor: `${accent}40`,
                    color: accent,
                  }}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div>
                  <p
                    className="text-sm font-bold mb-1"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {label}
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
