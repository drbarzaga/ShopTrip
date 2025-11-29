"use client";

import { useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useMotionValueEvent,
} from "framer-motion";
import type { Currency } from "@/lib/currency";

// Función helper para formatear moneda en el cliente (sin depender de Groq)
function formatCurrencyClient(
  amount: number,
  currency: Currency = "UYU"
): string {
  const getCurrencySymbol = (curr: Currency): string => {
    switch (curr) {
      case "UYU":
        return "$ UYU";
      case "USD":
        return "US$";
      default:
        return "$";
    }
  };

  const symbol = getCurrencySymbol(currency);

  if (currency === "UYU") {
    return `${symbol}${amount.toLocaleString("es-UY", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  }

  return `${symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

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
  const [display, setDisplay] = useState(formatCurrencyClient(0, currency));

  useEffect(() => {
    motionValue.set(value);
  }, [motionValue, value]);

  useMotionValueEvent(spring, "change", (latest) => {
    setDisplay(formatCurrencyClient(latest, currency));
  });

  return (
    <motion.span className={className} initial={false}>
      {display}
    </motion.span>
  );
}
