"use client";

import { fmtCurrency } from "@/lib/helpers";
import {
  motion,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect } from "react";

export default function CountUpMotion({ value }: { value: number }) {
  const shouldReduceMotion = useReducedMotion();
  const spring = useSpring(shouldReduceMotion ? value : 0, {
    mass: 0.6,
    stiffness: 90,
    damping: 20,
  });

  const display = useTransform(spring, (v) => fmtCurrency(v));

  useEffect(() => {
    if (!shouldReduceMotion) spring.set(value);
  }, [value, spring, shouldReduceMotion]);

  return <motion.span>{display}</motion.span>;
}
