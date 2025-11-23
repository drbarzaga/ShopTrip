"use client";

import { Progress } from "@/components/ui/progress";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardProgressProps {
  purchasedItems: number;
  totalItems: number;
}

export function DashboardProgress({
  purchasedItems,
  totalItems,
}: DashboardProgressProps) {
  const percentage =
    totalItems > 0 ? (purchasedItems / totalItems) * 100 : 0;

  return (
    <Card className="border border-primary/20 dark:border-primary/30 bg-gradient-to-br from-primary/5 to-purple-50/30 dark:from-primary/10 dark:to-purple-950/10 mb-6 sm:mb-8 shadow-sm">
      <CardHeader className="pb-4 p-5 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <CardTitle className="text-sm font-semibold text-foreground">
            Progreso General
          </CardTitle>
          <span className="text-lg sm:text-xl font-bold text-primary">
            {purchasedItems} / {totalItems}
          </span>
        </div>
        <div className="space-y-2">
          <Progress 
            value={percentage} 
            className="h-3 bg-muted/50"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm text-muted-foreground">
              {totalItems > 0
                ? `${Math.round(percentage)}% completado`
                : "Aún no hay productos"}
            </p>
            {totalItems > 0 && (
              <span className="text-xs font-medium text-primary">
                {totalItems - purchasedItems} pendientes
              </span>
            )}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}


