"use client";

import { useEffect, useState, useRef } from "react";
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
  const isFirstMount = useRef(true);
  const previousValue = useRef(value);
  const canAnimate = useRef(false);
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
    duration: duration * 1000,
  });
  // Inicializar display con el valor real para evitar blinking
  const [display, setDisplay] = useState(() => 
    Math.round(value).toLocaleString("es-ES")
  );

  useEffect(() => {
    if (isFirstMount.current) {
      // En el primer mount, usar requestAnimationFrame para animar después del render
      requestAnimationFrame(() => {
        canAnimate.current = true;
        motionValue.set(value);
      });
      isFirstMount.current = false;
      previousValue.current = value;
    } else if (previousValue.current !== value) {
      // En actualizaciones posteriores, animar normalmente
      motionValue.set(value);
      previousValue.current = value;
    }
  }, [motionValue, value]);

  useMotionValueEvent(spring, "change", (latest) => {
    // Solo actualizar display si podemos animar (evita el parpadeo inicial)
    if (canAnimate.current) {
      setDisplay(Math.round(latest).toLocaleString("es-ES"));
    }
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
  const isFirstMount = useRef(true);
  const previousValue = useRef(value);
  const previousCurrency = useRef(currency);
  const canAnimate = useRef(false);
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
    duration: duration * 1000,
  });
  // Inicializar display con el valor real para evitar blinking
  const [display, setDisplay] = useState(() => 
    formatCurrencyClient(value, currency)
  );

  useEffect(() => {
    if (isFirstMount.current) {
      // En el primer mount, usar requestAnimationFrame para animar después del render
      requestAnimationFrame(() => {
        canAnimate.current = true;
        motionValue.set(value);
      });
      isFirstMount.current = false;
      previousValue.current = value;
      previousCurrency.current = currency;
    } else if (previousValue.current !== value || previousCurrency.current !== currency) {
      // En actualizaciones posteriores, animar normalmente
      motionValue.set(value);
      previousValue.current = value;
      previousCurrency.current = currency;
    }
  }, [motionValue, value, currency]);

  useMotionValueEvent(spring, "change", (latest) => {
    // Solo actualizar display si podemos animar (evita el parpadeo inicial)
    if (canAnimate.current) {
      setDisplay(formatCurrencyClient(latest, currency));
    }
  });

  return (
    <motion.span className={className} initial={false}>
      {display}
    </motion.span>
  );
}
