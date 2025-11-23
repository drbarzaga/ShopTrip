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
    <Card className="border mb-6">
      <CardHeader className="pb-3 p-4">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Progreso
          </CardTitle>
          <span className="text-sm sm:text-base font-bold text-foreground">
            {purchasedItems} / {totalItems}
          </span>
        </div>
        <Progress value={percentage} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2">
          {totalItems > 0
            ? `${purchasedItems} de ${totalItems} productos completados (${Math.round(percentage)}%)`
            : "Aún no hay productos"}
        </p>
      </CardHeader>
    </Card>
  );
}


