"use client";

import { Progress } from "@/components/ui/progress";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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
    <Card className="mb-6 sm:mb-8">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
        <CardTitle className="text-xs sm:text-sm font-medium">
          Progreso General
        </CardTitle>
        <span className="text-xs sm:text-sm font-medium">
          {purchasedItems} / {totalItems}
        </span>
      </CardHeader>
      <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
        <div className="space-y-2">
          <Progress value={percentage} />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {totalItems > 0
                ? `${Math.round(percentage)}% completado`
                : "Aún no hay productos"}
            </span>
            {totalItems > 0 && (
              <span>{totalItems - purchasedItems} pendientes</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


