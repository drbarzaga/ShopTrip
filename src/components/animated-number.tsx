"use client";

import NumberFlow, { NumberFlowGroup } from "@number-flow/react";
import type { Currency } from "@/lib/currency";

interface AnimatedNumberProps {
  value: number;
  className?: string;
}

export function AnimatedNumber({ value, className }: AnimatedNumberProps) {
  return (
    <NumberFlow
      value={value}
      className={className}
      format={{ maximumFractionDigits: 0 }}
    />
  );
}

interface AnimatedCurrencyProps {
  value: number;
  currency?: Currency;
  className?: string;
}

export function AnimatedCurrency({ 
  value, 
  currency = "UYU",
  className 
}: AnimatedCurrencyProps) {
  return (
    <NumberFlow
      value={value}
      className={className}
      format={{
        style: "currency",
        currency: currency === "USD" ? "USD" : "UYU",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }}
      locales={currency === "USD" ? "en-US" : "es-UY"}
    />
  );
}

export { NumberFlowGroup };

