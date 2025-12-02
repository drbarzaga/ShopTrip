"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedNumber, AnimatedCurrency } from "@/components/animated-number";
import { CheckCircle2, DollarSign } from "lucide-react";
import type { Currency } from "@/lib/currency";

interface TripStatsCardsProps {
  purchasedItems: number;
  totalItems: number;
  totalSpent: number;
  currency: Currency;
}

export function TripStatsCards({
  purchasedItems,
  totalItems,
  totalSpent,
  currency,
}: TripStatsCardsProps) {
  return (
    <div className="grid gap-3 grid-cols-2 sm:gap-4 mb-6 [&>*]:min-w-0">
      {/* Total Gastado - Primero */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
          <CardTitle className="text-xs sm:text-sm font-medium min-w-0 flex-1">Total Gastado</CardTitle>
          <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-primary shrink-0 ml-2" />
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0 min-w-0 overflow-hidden">
          <div className="text-lg sm:text-xl lg:text-2xl font-bold break-words leading-tight">
            <AnimatedCurrency value={totalSpent} currency={currency} />
          </div>
        </CardContent>
      </Card>
      {/* Comprados - Segundo */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
          <CardTitle className="text-xs sm:text-sm font-medium">Comprados</CardTitle>
          <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
          <div className="text-xl sm:text-2xl font-bold">
            <AnimatedNumber value={purchasedItems} /> /{" "}
            <AnimatedNumber value={totalItems} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

