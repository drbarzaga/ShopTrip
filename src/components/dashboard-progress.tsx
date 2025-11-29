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
    <Card className="mb-6 sm:mb-8">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-sm font-medium">
            Progreso General
          </CardTitle>
          <span className="text-sm font-medium">
            {purchasedItems} / {totalItems}
          </span>
        </div>
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
      </CardHeader>
    </Card>
  );
}


