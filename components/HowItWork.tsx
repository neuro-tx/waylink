"use client";

import { useRef } from "react";
import { motion, useInView, Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";

import Link from "next/link";
import { Step, steps } from "@/lib/conatants";

interface StepCardProps {
  step: Step;
  index: number;
  steps: Step[];
}

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const stepVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
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

const ctaVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
};

function StepCard({ step, index, steps }: StepCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      variants={stepVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="relative flex gap-6 group"
    >
      <div className="flex flex-col items-center shrink-0">
        <motion.div
          className="relative flex items-center justify-center w-14 h-14 rounded-2xl border"
          style={{
            background: `linear-gradient(135deg, ${step.accent}22, ${step.accent}08)`,
            borderColor: `${step.accent}40`,
            color: step.accent,
          }}
          whileHover={{
            borderColor: `${step.accent}99`,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <step.icon className="w-7 h-7" />

          <motion.span
            className="absolute inset-0 rounded-2xl border"
            style={{ borderColor: step.accent }}
            initial={{ scale: 1, opacity: 0 }}
            whileHover={{ scale: 1.7, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </motion.div>

        {index < steps.length - 1 && (
          <motion.div
            className="w-px flex-1 mt-1 rounded-full min-h-12"
            style={{
              background: `linear-gradient(to bottom, ${step.accent}60, ${steps[index + 1].accent}20)`,
            }}
            initial={{ scaleY: 0, originY: "top" }}
            animate={inView ? { scaleY: 1 } : { scaleY: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          />
        )}
      </div>

      <div className="pb-10 flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <span
            className="text-xs font-bold tracking-[0.18em] uppercase"
            style={{ color: step.accent }}
          >
            {step.number} — {step.label}
          </span>
          <motion.span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: `${step.accent}18`, color: step.accent }}
            whileHover={{ scale: 1.08 }}
          >
            {step.tag}
          </motion.span>
        </div>

        <h3
          className="text-xl font-bold mb-2 leading-snug text-neutral-800 dark:text-neutral-100"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {step.title}
        </h3>

        <p className="text-sm leading-relaxed max-w-lg text-muted-foreground">
          {step.description}
        </p>
      </div>
    </motion.div>
  );
}

export default function HowItWorks() {
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-60px" });

  const stepsRef = useRef<HTMLDivElement>(null);
  const stepsInView = useInView(stepsRef, { once: true, margin: "-60px" });

  return (
    <section className="min-h-screen py-24 relative overflow-hidden bg-waylink-fade transition-colors duration-500 font-sans">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-20 right-16 w-64 h-64 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #FF6B35 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
          animate={{ y: [0, -14, 0], rotate: [0, 4, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-32 left-8 w-80 h-80 rounded-full opacity-[0.08]"
          style={{
            background: "radial-gradient(circle, #845EF7 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
          animate={{ y: [0, -10, 0], rotate: [0, -3, 0] }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-[0.05] blur-3xl"
          style={{
            background: "radial-gradient(circle, #00C9A7 0%, transparent 70%)",
          }}
          animate={{ y: [0, -8, 0] }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
        />

        <svg className="absolute inset-0 w-full h-full opacity-[0.03]">
          <defs>
            <pattern
              id="waylink-grid"
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
          <rect width="100%" height="100%" fill="url(#waylink-grid)" />
        </svg>
      </div>

      <div className="mian-container relative z-10">
        <motion.div
          ref={headerRef}
          variants={headerVariants}
          initial="hidden"
          animate={headerInView ? "visible" : "hidden"}
          className="mb-20 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <motion.div
              className="h-px w-12 bg-linear-to-r from-transparent to-orange-3"
              initial={{ scaleX: 0 }}
              animate={headerInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            />
            <span className="text-xs font-bold tracking-[0.22em] uppercase text-orange-3">
              How WayLink Works
            </span>
            <motion.div
              className="h-px w-12 bg-linear-to-l from-transparent to-orange-3"
              initial={{ scaleX: 0 }}
              animate={headerInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            />
          </div>

          <h2
            className="text-5xl md:text-6xl font-extrabold leading-[1.05] mb-5 text-neutral-800 dark:text-neutral-200"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Your Journey,{" "}
            <motion.span
              className="inline-block bg-clip-text text-transparent bg-linear-120 from-orange-3 via-blue-10 to-green-1"
              initial={{ opacity: 0, x: -12 }}
              animate={headerInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.25 }}
            >
              Simplified.
            </motion.span>
          </h2>

          <p className="text-base max-w-md mx-auto leading-relaxed text-gray-light">
            From signing up to sharing your story — every step on WayLink is
            designed to feel effortless and memorable.
          </p>
        </motion.div>

        <motion.div
          ref={stepsRef}
          variants={containerVariants}
          initial="hidden"
          animate={stepsInView ? "visible" : "hidden"}
          className="rounded-3xl max-w-3xl mx-auto p-6 md:p-12 border backdrop-blur-sm bg-white/70 dark:bg-[#16161e]/70 border-[#e8e4de] dark:border-[#2a2930]"
          style={{
            boxShadow: "0 32px 80px rgba(0,0,0,0.06)",
          }}
        >
          {steps.map((step: Step, i: number) => (
            <StepCard key={step.number} step={step} index={i} steps={steps} />
          ))}
        </motion.div>

        <motion.div
          variants={ctaVariants}
          initial="hidden"
          animate={headerInView ? "visible" : "hidden"}
          className="mt-12"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4 text-center sm:text-left">
            <p className="text-sm text-muted-foreground">
              Ready to experience travel differently?
            </p>

            <Link
              href="/trips"
              className="inline-flex items-center justify-center gap-2 text-sm font-semibold tracking-wide text-foreground group whitespace-nowrap"
            >
              <span className="hover:underline">Explore Experiences</span>

              <span className="bg-accent/50 border group-hover:bg-accent aspect-square w-6 h-6 grid place-items-center rounded-full transition-all duration-300 sm:-translate-x-3 sm:opacity-0 group-hover:sm:translate-x-0 group-hover:sm:opacity-100">
                <ArrowRight size={15} />
              </span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
