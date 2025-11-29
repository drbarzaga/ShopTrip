"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedNumber, AnimatedCurrency } from "@/components/animated-number";
import { CheckCircle2 } from "lucide-react";
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
    <div className="grid gap-3 grid-cols-2 sm:gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
          <CardTitle className="text-xs sm:text-sm font-medium">Comprados</CardTitle>
          <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
          <div className="text-xl sm:text-2xl font-bold">
            <AnimatedNumber value={purchasedItems} /> /{" "}
            <AnimatedNumber value={totalItems} />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
          <CardTitle className="text-xs sm:text-sm font-medium">Total Gastado</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
          <div className="text-xl sm:text-2xl font-bold">
            <AnimatedCurrency value={totalSpent} currency={currency} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

