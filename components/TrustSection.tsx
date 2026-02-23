"use client";

import { useRef } from "react";
import { motion, useInView, Variants } from "framer-motion";
import { ShieldCheck, Star } from "lucide-react";
import { Review, TrustCard, trustCards } from "@/lib/conatants";
import ReviewsSlider from "./Reviewsslider";

interface Stat {
  value: string;
  label: string;
  accent: string;
}

interface TrustCardProps {
  card: TrustCard;
  index: number;
}

interface StatItemProps {
  stat: Stat;
  index: number;
}

interface ReviewCardProps {
  review: Review;
  index: number;
}

const stats: Stat[] = [
  { value: "2M+", label: "Happy Travelers", accent: "#FF6B35" },
  { value: "98%", label: "Satisfaction Rate", accent: "#00C9A7" },
  { value: "50K+", label: "Experiences Booked", accent: "#845EF7" },
  { value: "4.9★", label: "Average Rating", accent: "#FF6B35" },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const statVariants: Variants = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

function TrustCardItem({ card, index }: TrustCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      variants={cardVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      custom={index}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="relative rounded-2xl border p-6 flex flex-col gap-4 group bg-white/60 dark:bg-[#16161e]/60 border-[#e8e4de] dark:border-[#2a2930] backdrop-blur-sm overflow-hidden"
    >
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-500"
        style={{
          background: `radial-gradient(ellipse at top left, ${card.accent}0d 0%, transparent 70%)`,
        }}
      />

      <div className="flex items-start justify-between relative z-10">
        <motion.div
          className="flex items-center justify-center w-12 h-12 rounded-xl border"
          style={{
            background: `linear-gradient(135deg, ${card.accent}22, ${card.accent}08)`,
            borderColor: `${card.accent}40`,
            color: card.accent,
          }}
          whileHover={{
            scale: 1.1,
            boxShadow: `0 0 20px 4px ${card.accent}35`,
            borderColor: `${card.accent}90`,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <card.icon className="w-5 h-5" />
        </motion.div>

        <span
          className="text-xs px-2.5 py-1 rounded-full font-semibold"
          style={{ background: `${card.accent}15`, color: card.accent }}
        >
          {card.tag}
        </span>
      </div>

      <div className="relative z-10">
        <h3
          className="text-base font-bold mb-1.5 text-[#1a1814] dark:text-[#f0eee8]"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {card.title}
        </h3>
        <p className="text-sm leading-relaxed text-[#6b6560] dark:text-[#9b9690]">
          {card.description}
        </p>
      </div>

      <motion.div
        className="absolute bottom-0 left-0 h-0.5 rounded-full"
        style={{
          background: `linear-gradient(to right, ${card.accent}, ${card.accent}00)`,
        }}
        initial={{ width: "0%" }}
        whileHover={{ width: "100%" }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
    </motion.div>
  );
}

function StatItem({ stat, index }: StatItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      variants={statVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      custom={index}
      className="flex flex-col items-center text-center gap-1"
    >
      <motion.span
        className="text-4xl md:text-5xl font-extrabold"
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          background: `linear-gradient(135deg, ${stat.accent}, ${stat.accent}99)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{
          duration: 0.6,
          delay: index * 0.1,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {stat.value}
      </motion.span>
      <span className="text-xs font-semibold tracking-widest uppercase text-[#6b6560] dark:text-[#6a6870]">
        {stat.label}
      </span>
    </motion.div>
  );
}

export default function TrustSection() {
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-60px" });

  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-40px" });

  const cardsRef = useRef<HTMLDivElement>(null);
  const cardsInView = useInView(cardsRef, { once: true, margin: "-60px" });

  return (
    <section className="min-h-screen py-24 relative overflow-hidden bg-waylink-fade transition-colors duration-500 font-sans">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-10 left-16 w-72 h-72 rounded-full opacity-[0.08]"
          style={{
            background: "radial-gradient(circle, #00C9A7 0%, transparent 70%)",
            filter: "blur(50px)",
          }}
          animate={{ y: [0, -12, 0], x: [0, 8, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-12 w-80 h-80 rounded-full opacity-[0.07]"
          style={{
            background: "radial-gradient(circle, #FF6B35 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
          animate={{ y: [0, -10, 0], rotate: [0, 3, 0] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        <motion.div
          className="absolute top-1/2 right-1/4 w-64 h-64 rounded-full opacity-[0.06]"
          style={{
            background: "radial-gradient(circle, #845EF7 0%, transparent 70%)",
            filter: "blur(70px)",
          }}
          animate={{ y: [0, -8, 0] }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
        />

        <svg className="absolute inset-0 w-full h-full opacity-[0.03]">
          <defs>
            <pattern
              id="trust-grid"
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
          <rect width="100%" height="100%" fill="url(#trust-grid)" />
        </svg>
      </div>

      <div className="mian-container relative z-10">
        <motion.div
          ref={headerRef}
          variants={headerVariants}
          initial="hidden"
          animate={headerInView ? "visible" : "hidden"}
          className="mb-16 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <motion.div
              className="h-px w-12"
              style={{
                background: "linear-gradient(to right, transparent, #00C9A7)",
              }}
              initial={{ scaleX: 0 }}
              animate={headerInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            />
            <span
              className="text-xs font-bold tracking-[0.22em] uppercase"
              style={{ color: "#00C9A7" }}
            >
              Why Trust WayLink
            </span>
            <motion.div
              className="h-px w-12"
              style={{
                background: "linear-gradient(to left, transparent, #00C9A7)",
              }}
              initial={{ scaleX: 0 }}
              animate={headerInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            />
          </div>

          <h2
            className="text-5xl md:text-6xl font-extrabold leading-[1.05] mb-5 text-[#1a1814] dark:text-[#f0eee8]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Built on{" "}
            <motion.span
              style={{
                background:
                  "linear-gradient(135deg, #00C9A7 0%, #845EF7 50%, #FF6B35 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                display: "inline-block",
              }}
              initial={{ opacity: 0, x: -12 }}
              animate={headerInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.25 }}
            >
              Transparency.
            </motion.span>
          </h2>

          <p className="text-base max-w-lg mx-auto leading-relaxed text-[#6b6560] dark:text-[#6a6870]">
            From your first search to your final review — every layer of WayLink
            is designed with your safety, privacy, and peace of mind at its
            core.
          </p>
        </motion.div>

        <motion.div
          ref={statsRef}
          variants={containerVariants}
          initial="hidden"
          animate={statsInView ? "visible" : "hidden"}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 rounded-3xl border p-8 bg-white/60 dark:bg-[#16161e]/60 border-[#e8e4de] dark:border-[#2a2930] backdrop-blur-sm"
          style={{ boxShadow: "0 16px 48px rgba(0,0,0,0.05)" }}
        >
          {stats.map((stat, i) => (
            <StatItem key={stat.label} stat={stat} index={i} />
          ))}
        </motion.div>

        <motion.div
          ref={cardsRef}
          variants={containerVariants}
          initial="hidden"
          animate={cardsInView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16"
        >
          {trustCards.map((card, i) => (
            <TrustCardItem key={card.title} card={card} index={i} />
          ))}
        </motion.div>

        <div className="my-16">
          <ReviewsSlider />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl border p-10 text-center relative overflow-hidden bg-white/60 dark:bg-[#16161e]/60 border-[#e8e4de] dark:border-[#2a2930] backdrop-blur-sm"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute -top-10 -left-10 w-48 h-48 rounded-full opacity-10 blur-2xl"
              style={{
                background:
                  "radial-gradient(circle, #FF6B35 0%, transparent 70%)",
              }}
            />
            <div
              className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full opacity-10 blur-2xl"
              style={{
                background:
                  "radial-gradient(circle, #00C9A7 0%, transparent 70%)",
              }}
            />
          </div>

          <div className="relative z-10">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-5 text-purple-500"
              style={{ background: "#00C9A715" }}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Your safety is our promise
            </div>

            <h3
              className="text-3xl md:text-4xl font-extrabold mb-3 text-[#1a1814] dark:text-[#f0eee8]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Travel with Confidence.
            </h3>

            <p className="text-sm text-[#6b6560] dark:text-[#9b9690] max-w-md mx-auto mb-8 leading-relaxed">
              Join over 2 million travelers who explore the world knowing
              WayLink has their back — every booking, every mile, every moment.
            </p>

            <div className="flex items-center justify-center">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.96 }}
                className="px-8 py-3.5 rounded-2xl text-sm font-bold tracking-wide border bg-transparent text-[#1a1814] dark:text-[#f0eee8] border-[#e8e4de] dark:border-[#2a2930]"
              >
                Learn About Safety →
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
