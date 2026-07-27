"use client";

import { fmtCurrency } from "@/lib/helpers";
import {
  motion,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect } from "react";

const fmtNumber = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);

export default function CountUpMotion({
  value,
  format,
}: {
  value: number;
  format?: "value" | "currency";
}) {
  const shouldReduceMotion = useReducedMotion();

  const spring = useSpring(shouldReduceMotion ? value : 0, {
    mass: 0.6,
    stiffness: 90,
    damping: 20,
  });

  const display = useTransform(spring, (v) =>
    format === "currency" ? fmtCurrency(v) : fmtNumber(v),
  );

  useEffect(() => {
    if (!shouldReduceMotion) spring.set(value);
  }, [value, spring, shouldReduceMotion]);

  return <motion.span>{display}</motion.span>;
}
