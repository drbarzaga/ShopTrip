"use client";

import { useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useMotionValueEvent,
} from "framer-motion";
import type { Currency } from "@/lib/currency";
import { formatCurrency } from "@/lib/currency";

interface AnimatedNumberProps {
  readonly value: number;
  readonly className?: string;
  readonly duration?: number;
}

export function AnimatedNumber({
  value,
  className,
  duration = 1.5,
}: AnimatedNumberProps) {
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
    duration: duration * 1000,
  });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    motionValue.set(value);
  }, [motionValue, value]);

  useMotionValueEvent(spring, "change", (latest) => {
    setDisplay(Math.round(latest).toLocaleString("es-ES"));
  });

  return (
    <motion.span className={className} initial={false}>
      {display}
    </motion.span>
  );
}

interface AnimatedCurrencyProps {
  readonly value: number;
  readonly currency?: Currency;
  readonly className?: string;
  readonly duration?: number;
}

export function AnimatedCurrency({
  value,
  currency = "UYU",
  className,
  duration = 1.5,
}: AnimatedCurrencyProps) {
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
    duration: duration * 1000,
  });
  const [display, setDisplay] = useState(formatCurrency(0, currency));

  useEffect(() => {
    motionValue.set(value);
  }, [motionValue, value]);

  useMotionValueEvent(spring, "change", (latest) => {
    setDisplay(formatCurrency(latest, currency));
  });

  return (
    <motion.span className={className} initial={false}>
      {display}
    </motion.span>
  );
}
