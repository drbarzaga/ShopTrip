"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedNumber, AnimatedCurrency } from "@/components/animated-number";
import { DollarSign, CheckCircle2, Calendar, TrendingUp } from "lucide-react";
import type { Currency } from "@/lib/currency";

interface DashboardStatsCardsProps {
  readonly stats: {
    readonly totalSpent: number;
    readonly purchasedItems: number;
    readonly totalItems: number;
    readonly totalTrips: number;
    readonly completedTrips: number;
    readonly activeTrips: number;
  };
  readonly currency: Currency;
}

export function DashboardStatsCards({
  stats,
  currency,
}: DashboardStatsCardsProps) {
  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4 mb-8">
      {/* Total Gastado */}
      <Card className="group cursor-default transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 active:shadow-md active:-translate-y-0.5 active:scale-[0.98] [&_*]:cursor-default [&_*]:pointer-events-none select-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
          <CardTitle className="text-xs sm:text-sm font-medium">
            Total Gastado
          </CardTitle>
          <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-primary transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-active:scale-110 group-active:rotate-3" />
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
          <div className="text-xl sm:text-2xl font-bold">
            <AnimatedCurrency value={stats.totalSpent} currency={currency} />
          </div>
          {stats.totalItems > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              <AnimatedNumber value={stats.purchasedItems} /> artículos
              comprados
            </p>
          )}
        </CardContent>
      </Card>

      {/* Comprados */}
      <Card className="group cursor-default transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 active:shadow-md active:-translate-y-0.5 active:scale-[0.98] [&_*]:cursor-default [&_*]:pointer-events-none select-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
          <CardTitle className="text-xs sm:text-sm font-medium">
            Comprados
          </CardTitle>
          <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-primary transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-active:scale-110 group-active:rotate-3" />
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
          <div className="text-xl sm:text-2xl font-bold">
            <AnimatedNumber value={stats.purchasedItems} />
          </div>
          {stats.totalItems > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              de <AnimatedNumber value={stats.totalItems} /> totales
            </p>
          )}
        </CardContent>
      </Card>

      {/* Total Viajes */}
      <Card className="group cursor-default transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 active:shadow-md active:-translate-y-0.5 active:scale-[0.98] [&_*]:cursor-default [&_*]:pointer-events-none select-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
          <CardTitle className="text-xs sm:text-sm font-medium">
            Total Viajes
          </CardTitle>
          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-primary transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-active:scale-110 group-active:rotate-3" />
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
          <div className="text-xl sm:text-2xl font-bold">
            <AnimatedNumber value={stats.totalTrips} />
          </div>
          {stats.totalTrips > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              <AnimatedNumber value={stats.completedTrips} /> completados
            </p>
          )}
        </CardContent>
      </Card>

      {/* Viajes Activos */}
      <Card className="group cursor-default transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 active:shadow-md active:-translate-y-0.5 active:scale-[0.98] [&_*]:cursor-default [&_*]:pointer-events-none select-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
          <CardTitle className="text-xs sm:text-sm font-medium">
            Viajes Activos
          </CardTitle>
          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-primary transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-active:scale-110 group-active:rotate-3" />
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
          <div className="text-xl sm:text-2xl font-bold">
            <AnimatedNumber value={stats.activeTrips} />
          </div>
          {stats.activeTrips > 0 && (
            <p className="text-xs text-muted-foreground mt-1">En progreso</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
