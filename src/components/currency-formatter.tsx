"use client";

import { useEffect, useState } from "react";
import { formatCurrencyWithUserPreference } from "@/lib/format-currency";
import type { Currency } from "@/lib/currency";

interface CurrencyFormatterProps {
  amount: number | null;
  storedCurrency?: Currency;
  className?: string;
}

export function CurrencyFormatter({ 
  amount, 
  storedCurrency = "USD",
  className 
}: CurrencyFormatterProps) {
  const [formatted, setFormatted] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function format() {
      try {
        const formattedAmount = await formatCurrencyWithUserPreference(
          amount,
          storedCurrency
        );
        setFormatted(formattedAmount);
      } catch (error) {
        console.error("Error formatting currency:", error);
        // Fallback básico
        setFormatted(amount !== null && amount !== undefined 
          ? `$${amount.toFixed(2)}` 
          : "$0.00");
      } finally {
        setIsLoading(false);
      }
    }

    format();
  }, [amount, storedCurrency]);

  if (isLoading) {
    return <span className={className}>...</span>;
  }

  return <span className={className}>{formatted}</span>;
}

